import { Channel, pinus } from "pinus";
import AreaPlayer from "./areaPlayer";
import RES from "../RES";
import EventName from "../EventName";
import { Status } from "../gameInterface";
import Action, { ActionPool } from "../service/Action";
import Queue from "../util/Queue"
import FrameData from "../service/FrameData";
import MysqlCenter from "../database/MysqlCenter";
import utils from "../util/utils";


/**
 * 游戏房间
 */
export default class AreaRoom {

    areaId = -1;                // 区间id
    roomId = "";                // 房间id 唯一标识      随机字符串, 让其他玩家无法进入
    minChip = 100;              // 最低进入金币
    betChip = 100;              // 没把所需的金币数目
    betExp = 100;

    maxNum = 2;                 // 房间最大人数
    playerList: Array<AreaPlayer> = [null, null];

    currentPlayerNum = 0;                   // 房间当前玩家数目
    readyNum = 0;                           // 准备好的玩家数目

    channel: Channel = null;                // 通道, 用于接收, 发送信息

    status = Status.NotEnoughPlayers;      // 房间的状态

    currentFrameCount = 0;                  // 当前的帧数

    allActionMap: {[key: number]: any} = {};            // 历史命令

    serverFrameInterval = 100;                          // 帧频率 单位ms
    serverTimeout = 15000;                              // 掉线
    useLocal = false;                                   // 是否使用ai

    actionPool: ActionPool = null;                      // 对象池
    actionQueue: Queue<Action> = null;                 // 动作指令队列, 先进先出, 每帧收到的最大action数目为5
    frameData: FrameData = null;                        // 每一帧发出的数据, 封装类

    timer: NodeJS.Timer = null;                         // tick 的定时器

    /**
     * 初始化房间参数
     */
    constructor(areaId: number, roomId: string) {
        this.areaId = areaId;
        this.roomId = roomId;
    }
    /**
     * 初始化配置
     * @param maxNum 
     * @param minChip 
     * @param betChip 
     */
    initConfig(maxNum: number, minChip: number, betChip: number, betExp: number) {
        this.maxNum = maxNum;
        this.minChip = minChip;
        this.betChip = betChip;
        this.betExp = betExp;

        this.actionPool = new ActionPool(5);
        this.frameData = new FrameData();
        this.actionQueue = new Queue<Action>(100);
    }
    /**
     * --------------------- 游戏开始前   进入房间 退出房间, 玩家坐下, 玩家站起 ---------------------
     */
    /**
     * 玩家进入
     * step1 玩家进入房间
     * step2 玩家坐下
     * @param player 
     */
    playerEnter(player: AreaPlayer) {
        if(this.currentPlayerNum > this.maxNum) {
            return {code: RES.ERR_ROOM_FULL, msg: null};
        }
        if(player.seatId != -1) {
            return {code: RES.ERR_PLAYER_IS_IN_ROOM, msg: null};
        }

        player.enterRoom(this.roomId);      // 玩家进入房间
        this.currentPlayerNum ++;           // 这时玩家还没有坐下

        // 返回房间内其他人的信息
        for(let i=0; i<this.playerList.length; i++) {
            if(!this.playerList[i]) {
                continue;
            }
            this.getChannel().__channelService__.pushMessageByUids(EventName.onPlayerEnterRoom, this.playerList[i].playerInfo, [{uid: player.openId, sid: player.serverId}])
        }
        
        if(!this.playerSitdown(player)) {          // 玩家坐下
            return {code: RES.ERR_PARAM, msg: null}
        }   

        this.getChannel().add(player.openId, player.serverId);
        // 广播自己进入房间的信息
        this.getChannel().pushMessage(
            EventName.onUserEnterRoom,
            {
                playerInfo: player.playerInfo,
            }
        );

        // 检验是否可以开始游戏了
        this.checkGameCanStart();
        return {code: RES.OK, msg: {}}
    }
    /**
     * 玩家离开房间
     * @param player 
     */
    playerQuit(player: AreaPlayer) {
        if(player.seatId == -1) {
            return {code: RES.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null};
        }
        if(!this.playerList[player.seatId]) {
            return {code: RES.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null};
        }
        
        if(player.state == Status.Playing) {
            return  {code: RES.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null};
        }
        
        this.getChannel().pushMessage(
            EventName.onPlayerQuitRoom,
            {
                playerOpenId: player.openId,
            }
        );

        this.getChannel().leave(player.openId, player.serverId);

        this.playerStandup(player);

        this.currentPlayerNum --;
        player.quitRoom();

        return {code: RES.OK, msg: {}}
    }
    /**
     * 寻找一个位子
     */
    doSearchEmptySeat() {
        for(let i=0; i<this.maxNum; i++) {
            if(this.playerList[i] == null) {    // 找到一个空位
                return i;
            }
        }
        return -1;
    }
    /**
     * 玩家坐下
     */
    playerSitdown(player: AreaPlayer) {
        let seatId = this.doSearchEmptySeat();
        if(seatId == -1) {
            return false;
        }
        this.playerList[seatId] = player;
        player.sitDown(seatId);
        return true;
    }
    
    /**
     * 玩家站起
     */
    playerStandup(player: AreaPlayer) {
        if(player.seatId == -1) {
            return true;
        }
        this.playerList[player.seatId] = null;
        player.standUp();
        return true;
    }

    /**
     * --------------------- 游戏进行中 ------------------------
     */
    checkGameCanStart() {
        if(this.currentPlayerNum == this.maxNum) {
            this.status = Status.CanStartGame;      // 改变房间的状态
            this.getChannel().pushMessage(
                EventName.onGameCanStart,
                {
                    waitTime: 2,                    // 等待玩家进入游戏场景
                }
            );
        }
    }
    /**
     * 
     * @param action 添加一个动作
     */
    addAction(msg: Action, seatId: number) {
        let action = this.actionPool.create();
        action.setSeatId(seatId);
        action.setCmdAndData(msg.cmd, msg.data);
        this.actionQueue.push(action);
    }
    /**
     * 进入游戏场景
     */
    enterGameScene(player: AreaPlayer) {
        if(player.seatId == -1) {
            return false;
        }
        if(player.state == Status.OnTheSeat) {
            this.readyNum ++;
            player.ready();
        }

        if(this.readyNum == this.maxNum) {
            let playerInfoList = [];
            for(let i=0; i<this.playerList.length; i++) {
                playerInfoList.push({
                    seatId: this.playerList[i].seatId,
                    playerInfo: this.playerList[i].playerInfo
                });
            }
            // 游戏正式开始
            this.getChannel().pushMessage(
                EventName.onWaitGameStart, 
                {
                    waitTime: 3,
                    playerInfoList: playerInfoList,
                }
            );
            // 客户端动画播放时间, 不允许游戏进行
            setTimeout(this.run.bind(this), 3000);
        }
        return true;
    }
    /**
     * 游戏开始了
     */
    run() {
        this.getChannel().pushMessage(
            EventName.onGameStart, 
            {
                
            }
        );
        this.status = Status.Playing;
        for(let player of this.playerList) {
            player.playing();
        }
        this.timer = setInterval(this.tick.bind(this), this.serverFrameInterval);
    }
    /**
     * 应为该方法会被频繁调用, 所以需要尽量优化, 不要new
     */
    tick() {
        this.currentFrameCount ++;
        this.broadcastAction();
    }
    /**
     * 广播当前帧的命令
     */
    broadcastAction() {
        // 设置frameData中的数据, 发至客户端
        this.frameData.setCurFrame(this.currentFrameCount);
        let action = null;
        while((action = this.actionQueue.pop()) != null) {
            this.frameData.addAction(action);
        }

        // push数据
        this.getChannel().pushMessage(
            EventName.onFrameEvent, 
            this.frameData
        );

        // 回收frameData
        for(let action of this.frameData.actionList) {
            this.actionPool.recover(action);
        }
        this.frameData.clearActionList();
    }

    /**
     * ----------------------------- 游戏结束后 -------------------------
     */
    async gameOver(msg: {isWin: number}, seatId: number) {
        let player = this.playerList[seatId];
        if(!player || player.isWin != 0) {
            return ;
        }
        player.isWin = msg.isWin;

        if(this.playerList[0].isWin + this.playerList[1].isWin == 0 && this.playerList[0].isWin != 0 && this.playerList[1].isWin != 0) {
            let playerBody = [];
            for(let player of this.playerList) {
                playerBody.push({openId: player.openId, seatId: player.seatId, isWin: player.isWin});
            }

            if(this.timer != null) {
                clearInterval(this.timer);          // 停止帧同步
                this.timer = null;
            }

            this.getChannel().pushMessage(
                EventName.onGameOver,
                playerBody
            );

            await this.checkOut();              // 结算
        }
    }

    async checkOut() {
        // 计算每个玩家的输赢
        let body = [];
        for(let player of this.playerList) {
            let chip = this.betChip * player.isWin;
            let exp = this.betChip;
            body.push({playerInfo: player.playerInfo, chip: chip, exp: exp});
            await player.checkOutGame(chip, exp);
        }
        let playerA = this.playerList[0];
        let playerB = this.playerList[1];
        let df = utils.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        let strTime1 = df["format"]();
        await MysqlCenter.insertFightHistory(playerA, playerB, strTime1, this.betChip, this.betChip, playerA.isWin, playerB.isWin, "");

        this.getChannel().pushMessage(
            EventName.onCheckGame, 
            body
        );
    }
    // 结算完毕
    checkOutOver() {
        // 清除房间过时信息
        this.currentFrameCount = 0;
        this.status = Status.NotEnoughPlayers;
        this.allActionMap = null;
        this.actionPool = null;
        this.actionQueue =  null;
        this.frameData = null;
        this.timer = null;
        //清除玩家信息
        for(let player of this.playerList) {
            this.playerQuit(player);
        }
        this.playerList = [];
        this.currentPlayerNum = 0;
    }

    /**
     * 清理房间
     */
    clearRoom() {
        for(let key in this.playerList) {
            let data = this.playerQuit(this.playerList[key]);;
            if(data.code != RES.OK) {
                return false;
            }
        }
        this.getChannel().destroy();
        this.playerList = null;
        this.currentFrameCount = 0;
        this.status = Status.NotEnoughPlayers;
        this.allActionMap = null;
        this.actionPool = null;
        this.actionQueue =  null;
        this.frameData = null;
        this.timer = null;
        return true;
    }

    /**
     * ------------------------------------ 工具方法 ------------------------------------
     */
    getPlayerBySeatId(seatId: number) {
        return this.playerList[seatId];
    }
    getAllPlayers() {
        return this.playerList;
    }
    /**
     * 获取通道
     * 有就返回, 没有就新建一个
     */
    getChannel() {
        if (this.channel) {
            return this.channel;
        }
        this.channel = pinus.app.get('channelService').getChannel('area_room_' + this.roomId, true);       // true表示没有就会新建
        return this.channel;
    }



}