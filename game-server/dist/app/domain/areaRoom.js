"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const RES_1 = require("../RES");
const EventName_1 = require("../EventName");
const gameInterface_1 = require("../gameInterface");
const Action_1 = require("../service/Action");
const Queue_1 = require("../util/Queue");
const FrameData_1 = require("../service/FrameData");
const MysqlCenter_1 = require("../database/MysqlCenter");
const utils_1 = require("../util/utils");
/**
 * 游戏房间
 */
class AreaRoom {
    /**
     * 初始化房间参数
     */
    constructor(areaId, roomId) {
        this.areaId = -1; // 区间id
        this.roomId = ""; // 房间id 唯一标识      随机字符串, 让其他玩家无法进入
        this.minChip = 100; // 最低进入金币
        this.betChip = 100; // 没把所需的金币数目
        this.maxNum = 2; // 房间最大人数
        this.playerList = [null, null];
        this.currentPlayerNum = 0; // 房间当前玩家数目
        this.readyNum = 0; // 准备好的玩家数目
        this.channel = null; // 通道, 用于接收, 发送信息
        this.status = gameInterface_1.Status.NotEnoughPlayers; // 房间的状态
        this.currentFrameCount = 0; // 当前的帧数
        this.allActionMap = {}; // 历史命令
        this.serverFrameInterval = 100; // 帧频率 单位ms
        this.serverTimeout = 15000; // 掉线
        this.useLocal = false; // 是否使用ai
        this.actionPool = null; // 对象池
        this.actionQueue = null; // 动作指令队列, 先进先出, 每帧收到的最大action数目为5
        this.frameData = null; // 每一帧发出的数据, 封装类
        this.timer = null; // tick 的定时器
        this.areaId = areaId;
        this.roomId = roomId;
    }
    /**
     * 初始化配置
     * @param maxNum
     * @param minChip
     * @param betChip
     */
    initConfig(maxNum, minChip, betChip) {
        this.maxNum = maxNum;
        this.minChip = minChip;
        this.betChip = betChip;
        this.actionPool = new Action_1.ActionPool(5);
        this.frameData = new FrameData_1.default();
        this.actionQueue = new Queue_1.default(100);
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
    playerEnter(player) {
        if (this.currentPlayerNum > this.maxNum) {
            return { code: RES_1.default.ERR_ROOM_FULL, msg: null };
        }
        if (player.seatId != -1) {
            return { code: RES_1.default.ERR_PLAYER_IS_IN_ROOM, msg: null };
        }
        player.enterRoom(this.roomId); // 玩家进入房间
        this.currentPlayerNum++; // 这时玩家还没有坐下
        // 返回房间内其他人的信息
        for (let i = 0; i < this.playerList.length; i++) {
            if (!this.playerList[i]) {
                continue;
            }
            this.getChannel().__channelService__.pushMessageByUids(EventName_1.default.onPlayerEnterRoom, this.playerList[i].playerInfo, [{ uid: player.openId, sid: player.serverId }]);
        }
        if (!this.playerSitdown(player)) { // 玩家坐下
            return { code: RES_1.default.ERR_PARAM, msg: null };
        }
        this.getChannel().add(player.openId, player.serverId);
        // 广播自己进入房间的信息
        this.getChannel().pushMessage(EventName_1.default.onUserEnterRoom, {
            playerInfo: player.playerInfo,
        });
        // 检验是否可以开始游戏了
        this.checkGameCanStart();
        return { code: RES_1.default.OK, msg: {} };
    }
    /**
     * 玩家离开房间
     * @param player
     */
    playerQuit(player) {
        if (player.seatId == -1) {
            return { code: RES_1.default.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null };
        }
        if (!this.playerList[player.seatId]) {
            return { code: RES_1.default.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null };
        }
        if (player.state == gameInterface_1.Status.Playing) {
            return { code: RES_1.default.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null };
        }
        this.getChannel().pushMessage(EventName_1.default.onPlayerQuitRoom, {
            playerOpenId: player.openId,
        });
        this.getChannel().leave(player.openId, player.serverId);
        this.playerStandup(player);
        this.currentPlayerNum--;
        player.quitRoom();
        return { code: RES_1.default.OK, msg: {} };
    }
    /**
     * 寻找一个位子
     */
    doSearchEmptySeat() {
        for (let i = 0; i < this.maxNum; i++) {
            if (this.playerList[i] == null) { // 找到一个空位
                return i;
            }
        }
        return -1;
    }
    /**
     * 玩家坐下
     */
    playerSitdown(player) {
        let seatId = this.doSearchEmptySeat();
        if (seatId == -1) {
            return false;
        }
        this.playerList[seatId] = player;
        player.sitDown(seatId);
        return true;
    }
    /**
     * 玩家站起
     */
    playerStandup(player) {
        if (player.seatId == -1) {
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
        if (this.currentPlayerNum == this.maxNum) {
            this.status = gameInterface_1.Status.CanStartGame; // 改变房间的状态
            this.getChannel().pushMessage(EventName_1.default.onGameCanStart, {
                waitTime: 2,
            });
        }
    }
    /**
     *
     * @param action 添加一个动作
     */
    addAction(msg, seatId) {
        let action = this.actionPool.create();
        action.setSeatId(seatId);
        action.setCmdAndData(msg.cmd, msg.data);
        this.actionQueue.push(action);
    }
    /**
     * 进入游戏场景
     */
    enterGameScene(player) {
        if (player.seatId == -1) {
            return false;
        }
        if (player.state == gameInterface_1.Status.OnTheSeat) {
            this.readyNum++;
            player.ready();
        }
        if (this.readyNum == this.maxNum) {
            let playerInfoList = [];
            for (let i = 0; i < this.playerList.length; i++) {
                playerInfoList.push({
                    seatId: this.playerList[i].seatId,
                    playerInfo: this.playerList[i].playerInfo
                });
            }
            // 游戏正式开始
            this.getChannel().pushMessage(EventName_1.default.onWaitGameStart, {
                waitTime: 3,
                playerInfoList: playerInfoList,
            });
            // 客户端动画播放时间, 不允许游戏进行
            setTimeout(this.run.bind(this), 3000);
        }
        return true;
    }
    /**
     * 游戏开始了
     */
    run() {
        this.getChannel().pushMessage(EventName_1.default.onGameStart, {});
        this.status = gameInterface_1.Status.Playing;
        for (let player of this.playerList) {
            player.playing();
        }
        this.timer = setInterval(this.tick.bind(this), this.serverFrameInterval);
    }
    /**
     * 应为该方法会被频繁调用, 所以需要尽量优化, 不要new
     */
    tick() {
        this.currentFrameCount++;
        this.broadcastAction();
    }
    /**
     * 广播当前帧的命令
     */
    broadcastAction() {
        // 设置frameData中的数据, 发至客户端
        this.frameData.setCurFrame(this.currentFrameCount);
        let action = null;
        while ((action = this.actionQueue.pop()) != null) {
            this.frameData.addAction(action);
        }
        // push数据
        this.getChannel().pushMessage(EventName_1.default.onFrameEvent, this.frameData);
        // 回收frameData
        for (let action of this.frameData.actionList) {
            this.actionPool.recover(action);
        }
        this.frameData.clearActionList();
    }
    /**
     * ----------------------------- 游戏结束后 -------------------------
     */
    async gameOver(msg, seatId) {
        let player = this.playerList[seatId];
        if (!player || player.isWin != 0) {
            return;
        }
        player.isWin = msg.isWin;
        if (this.playerList[0].isWin + this.playerList[1].isWin == 0 && this.playerList[0].isWin != 0 && this.playerList[1].isWin != 0) {
            let playerBody = [];
            for (let player of this.playerList) {
                playerBody.push({ openId: player.openId, seatId: player.seatId, isWin: player.isWin });
            }
            if (this.timer != null) {
                clearInterval(this.timer); // 停止帧同步
                this.timer = null;
            }
            this.getChannel().pushMessage(EventName_1.default.onGameOver, playerBody);
            await this.checkOut(); // 结算
        }
    }
    async checkOut() {
        // 计算每个玩家的输赢
        let body = [];
        for (let player of this.playerList) {
            let chip = this.betChip * player.isWin;
            let exp = this.betChip;
            body.push({ playerInfo: player.playerInfo, chip: chip, exp: exp });
            await player.checkOutGame(chip, exp);
        }
        let playerA = this.playerList[0];
        let playerB = this.playerList[1];
        let df = utils_1.default.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        let strTime1 = df["format"]();
        await MysqlCenter_1.default.insertFightHistory(playerA, playerB, strTime1, this.betChip, this.betChip, playerA.isWin, playerB.isWin, "");
        this.getChannel().pushMessage(EventName_1.default.onCheckGame, body);
    }
    // 结算完毕
    checkOutOver() {
        // 清除房间过时信息
        this.currentFrameCount = 0;
        this.status = gameInterface_1.Status.NotEnoughPlayers;
        this.allActionMap = null;
        this.actionPool = null;
        this.actionQueue = null;
        this.frameData = null;
        this.timer = null;
        //清除玩家信息
        for (let player of this.playerList) {
            this.playerQuit(player);
        }
        this.playerList = [];
        this.currentPlayerNum = 0;
    }
    /**
     * 清理房间
     */
    clearRoom() {
        for (let key in this.playerList) {
            let data = this.playerQuit(this.playerList[key]);
            ;
            if (data.code != RES_1.default.OK) {
                return false;
            }
        }
        this.getChannel().destroy();
        this.playerList = null;
        this.currentFrameCount = 0;
        this.status = gameInterface_1.Status.NotEnoughPlayers;
        this.allActionMap = null;
        this.actionPool = null;
        this.actionQueue = null;
        this.frameData = null;
        this.timer = null;
        return true;
    }
    /**
     * ------------------------------------ 工具方法 ------------------------------------
     */
    getPlayerBySeatId(seatId) {
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
        this.channel = pinus_1.pinus.app.get('channelService').getChannel('area_room_' + this.roomId, true); // true表示没有就会新建
        return this.channel;
    }
}
exports.default = AreaRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLGdDQUF5QjtBQUN6Qiw0Q0FBcUM7QUFDckMsb0RBQTBDO0FBQzFDLDhDQUF1RDtBQUN2RCx5Q0FBaUM7QUFDakMsb0RBQTZDO0FBQzdDLHlEQUFrRDtBQUNsRCx5Q0FBa0M7QUFHbEM7O0dBRUc7QUFDSDtJQStCSTs7T0FFRztJQUNILFlBQVksTUFBYyxFQUFFLE1BQWM7UUFoQzFDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFnQixPQUFPO1FBQ25DLFdBQU0sR0FBRyxFQUFFLENBQUMsQ0FBZ0Isa0NBQWtDO1FBQzlELFlBQU8sR0FBRyxHQUFHLENBQUMsQ0FBYyxTQUFTO1FBQ3JDLFlBQU8sR0FBRyxHQUFHLENBQUMsQ0FBYyxZQUFZO1FBRXhDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBaUIsU0FBUztRQUNyQyxlQUFVLEdBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTdDLHFCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFtQixXQUFXO1FBQ25ELGFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBMkIsV0FBVztRQUVuRCxZQUFPLEdBQVksSUFBSSxDQUFDLENBQWdCLGlCQUFpQjtRQUV6RCxXQUFNLEdBQUcsc0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFNLFFBQVE7UUFFL0Msc0JBQWlCLEdBQUcsQ0FBQyxDQUFDLENBQWtCLFFBQVE7UUFFaEQsaUJBQVksR0FBeUIsRUFBRSxDQUFDLENBQVksT0FBTztRQUUzRCx3QkFBbUIsR0FBRyxHQUFHLENBQUMsQ0FBMEIsV0FBVztRQUMvRCxrQkFBYSxHQUFHLEtBQUssQ0FBQyxDQUE4QixLQUFLO1FBQ3pELGFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBbUMsU0FBUztRQUU3RCxlQUFVLEdBQWUs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