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
        this.betExp = 100;
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
    initConfig(maxNum, minChip, betChip, betExp) {
        this.maxNum = maxNum;
        this.minChip = minChip;
        this.betChip = betChip;
        this.betExp = betExp;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLGdDQUF5QjtBQUN6Qiw0Q0FBcUM7QUFDckMsb0RBQTBDO0FBQzFDLDhDQUF1RDtBQUN2RCx5Q0FBaUM7QUFDakMsb0RBQTZDO0FBQzdDLHlEQUFrRDtBQUNsRCx5Q0FBa0M7QUFHbEM7O0dBRUc7QUFDSDtJQWdDSTs7T0FFRztJQUNILFlBQVksTUFBYyxFQUFFLE1BQWM7UUFqQzFDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFnQixPQUFPO1FBQ25DLFdBQU0sR0FBRyxFQUFFLENBQUMsQ0FBZ0Isa0NBQWtDO1FBQzlELFlBQU8sR0FBRyxHQUFHLENBQUMsQ0FBYyxTQUFTO1FBQ3JDLFlBQU8sR0FBRyxHQUFHLENBQUMsQ0FBYyxZQUFZO1FBQ3hDLFdBQU0sR0FBRyxHQUFHLENBQUM7UUFFYixXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQWlCLFNBQVM7UUFDckMsZUFBVSxHQUFzQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3QyxxQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBbUIsV0FBVztRQUNuRCxhQUFRLEdBQUcsQ0FBQyxDQUFDLENBQTJCLFdBQVc7UUFFbkQsWUFBTyxHQUFZLElBQUksQ0FBQyxDQUFnQixpQkFBaUI7UUFFekQsV0FBTSxHQUFHLHNCQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBTSxRQUFRO1FBRS9DLHNCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFrQixRQUFRO1FBRWhELGlCQUFZLEdBQXlCLEVBQUUsQ0FBQyxDQUFZLE9BQU87UUFFM0Qsd0JBQW1CLEdBQUcsR0FBRyxDQUFDLENBQTBCLFdBQVc7UUFDL0Qsa0JBQWEsR0FBRyxLQUFLLENBQUMsQ0FBOEIsS0FBSztRQUN6RCxhQUFRLEdBQUcsS0FBSyxDQUFDLENB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