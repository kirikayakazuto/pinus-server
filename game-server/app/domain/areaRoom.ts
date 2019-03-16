import { Channel, pinus } from "pinus";
import AreaPlayer from "./areaPlayer";
import RES from "../RES";
import EventName from "../EventName";
import { Status } from "../gameInterface";
import ActionManagerService from "../service/actionManagerService";
import Action from "../service/Action";

/**
 * 游戏房间
 */
export default class AreaRoom {

    areaId = -1;                // 区间id
    roomId = "";                // 房间id 唯一标识      随机字符串, 让其他玩家无法进入
    minChip = 100;              // 最低进入金币
    betChip = 100;              // 没把所需的金币数目

    maxNum = 2;                 // 房间最大人数
    // playerList: {[openId: string]: AreaPlayer} = {};
    playerList: Array<AreaPlayer> = [null, null];
    actionManagerService: ActionManagerService = null;

    currentPlayerNum = 0;                 // 房间当前玩家数目
    readyNum = 0;                           // 准备好的玩家数目

    channel: Channel = null;                // 通道, 用于接收, 发送信息

    status = Status.NotEnoughPlayers;      // 房间的状态

    

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
    initConfig(maxNum: number, minChip: number, betChip: number) {
        this.maxNum = maxNum;
        this.minChip = minChip;
        this.betChip = betChip;
    }
    /**
     * 添加事件
     */
    addEvent(player: AreaPlayer) {
        let self = this;
        player.eventEmitter.on("good", () => {

        })
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
        return true;
    }

    /**
     * --------------------- 游戏开始后 ------------------------
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
     * 进入游戏场景
     */
    enterGameScene(player: AreaPlayer) {
        if(player.seatId == -1) {
            return false;
        }
        if(player.state == Status.InView) {
            this.readyNum ++;
            player.state = Status.Ready;
        }

        if(this.readyNum == this.maxNum) {
            // 游戏正式开始
            this.getChannel().pushMessage(
                EventName.onWaitGameStart, 
                {
                    waitTime: 3,
                }
            );
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
        // 启动动作管理系统
        this.actionManagerService = new ActionManagerService(this.areaId, this.roomId);
        setInterval(this.tick, 100);
    }
    tick() {
        this.actionManagerService.update();
    }
    /**
     * 
     * @param action 添加一个动作
     */
    addAction(action: Action) {
        this.actionManagerService.addAction(action);
    }
    /**
     * 停止一个动作
     * @param type 
     * @param id 
     */
    abortAction(type: string, id: number) {
        this.actionManagerService.abortAction(type, id);
    }
    /**
     * 停止某个玩家所有的动作
     */
    abortAllAction(id: number) {
        this.actionManagerService.abortAllAction(id);
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
     * ------------------------------------ 工具方法 ------------------------------------
     */
    getPlayerBySeatId(seatId: number) {
        return this.playerList[seatId];
    }
    getAllPlayers() {
        return this.playerList;
    }



}