"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const RES_1 = require("../RES");
const EventName_1 = require("../EventName");
const gameInterface_1 = require("../gameInterface");
const Action_1 = require("../service/Action");
const Queue_1 = require("../util/Queue");
const FrameData_1 = require("../service/FrameData");
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
        this.actionPool = null;
        this.frameData = null;
        this.actionQueue = null;
        return true;
    }
    /**
     * --------------------- 游戏开始后 ------------------------
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
     * 进入游戏场景
     */
    enterGameScene(player) {
        if (player.seatId == -1) {
            return false;
        }
        if (player.state == gameInterface_1.Status.InView) {
            this.readyNum++;
            player.state = gameInterface_1.Status.Ready;
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
            setTimeout(this.run.bind(this), 3000);
        }
        return true;
    }
    /**
     * 游戏开始了
     */
    run() {
        this.getChannel().pushMessage(EventName_1.default.onGameStart, {});
        setInterval(this.tick.bind(this), this.serverFrameInterval);
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
        this.frameData.setCurFrame(this.currentFrameCount);
        let action = null;
        while ((action = this.actionQueue.pop()) != null) {
            this.frameData.addAction(action);
        }
        this.getChannel().pushMessage(EventName_1.default.onFrameEvent, this.frameData);
        for (let action of this.frameData.actionList) {
            this.actionPool.recover(action);
        }
        this.frameData.clearActionList();
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
     * ------------------------------------ 工具方法 ------------------------------------
     */
    getPlayerBySeatId(seatId) {
        return this.playerList[seatId];
    }
    getAllPlayers() {
        return this.playerList;
    }
}
exports.default = AreaRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLGdDQUF5QjtBQUN6Qiw0Q0FBcUM7QUFDckMsb0RBQTBDO0FBQzFDLDhDQUF1RDtBQUN2RCx5Q0FBaUM7QUFDakMsb0RBQTZDO0FBRzdDOztHQUVHO0FBQ0g7SUE4Qkk7O09BRUc7SUFDSCxZQUFZLE1BQWMsRUFBRSxNQUFjO1FBL0IxQyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsT0FBTztRQUNuQyxXQUFNLEdBQUcsRUFBRSxDQUFDLENBQWdCLGtDQUFrQztRQUM5RCxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsU0FBUztRQUNyQyxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsWUFBWTtRQUV4QyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQWlCLFNBQVM7UUFDckMsZUFBVSxHQUFzQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3QyxxQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBbUIsV0FBVztRQUNuRCxhQUFRLEdBQUcsQ0FBQyxDQUFDLENBQTJCLFdBQVc7UUFFbkQsWUFBTyxHQUFZLElBQUksQ0FBQyxDQUFnQixpQkFBaUI7UUFFekQsV0FBTSxHQUFHLHNCQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBTSxRQUFRO1FBRS9DLHNCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFrQixRQUFRO1FBRWhELGlCQUFZLEdBQXlCLEVBQUUsQ0FBQyxDQUFZLE9BQU87UUFFM0Qsd0JBQW1CLEdBQUcsR0FBRyxDQUFDLENBQTBCLFdBQVc7UUFDL0Qsa0JBQWEsR0FBRyxLQUFLLENBQUMsQ0FBOEIsS0FBSztRQUN6RCxhQUFRLEdBQUcsS0FBSyxDQUFDLENBQW1DLFNBQVM7UUFFN0QsZUFBVSxHQUFlLElBQUksQ0FBQyxDQUFzQixNQUFNO1FBQzFE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