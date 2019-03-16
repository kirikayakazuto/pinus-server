"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const RES_1 = require("../RES");
const EventName_1 = require("../EventName");
const gameInterface_1 = require("../gameInterface");
const actionManagerService_1 = require("../service/actionManagerService");
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
        // playerList: {[openId: string]: AreaPlayer} = {};
        this.playerList = [null, null];
        this.actionManagerService = null;
        this.currentPlayerNum = 0; // 房间当前玩家数目
        this.readyNum = 0; // 准备好的玩家数目
        this.channel = null; // 通道, 用于接收, 发送信息
        this.status = gameInterface_1.Status.NotEnoughPlayers; // 房间的状态
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
    }
    /**
     * 添加事件
     */
    addEvent(player) {
        let self = this;
        player.eventEmitter.on("good", () => {
        });
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
            // 游戏正式开始
            this.getChannel().pushMessage(EventName_1.default.onWaitGameStart, {
                waitTime: 3,
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
        // 启动动作管理系统
        this.actionManagerService = new actionManagerService_1.default(this.areaId, this.roomId);
        setInterval(this.tick, 100);
    }
    tick() {
        this.actionManagerService.update();
    }
    /**
     *
     * @param action 添加一个动作
     */
    addAction(action) {
        this.actionManagerService.addAction(action);
    }
    /**
     * 停止一个动作
     * @param type
     * @param id
     */
    abortAction(type, id) {
        this.actionManagerService.abortAction(type, id);
    }
    /**
     * 停止某个玩家所有的动作
     */
    abortAllAction(id) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLGdDQUF5QjtBQUN6Qiw0Q0FBcUM7QUFDckMsb0RBQTBDO0FBQzFDLDBFQUFtRTtBQUduRTs7R0FFRztBQUNIO0lBbUJJOztPQUVHO0lBQ0gsWUFBWSxNQUFjLEVBQUUsTUFBYztRQXBCMUMsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQWdCLE9BQU87UUFDbkMsV0FBTSxHQUFHLEVBQUUsQ0FBQyxDQUFnQixrQ0FBa0M7UUFDOUQsWUFBTyxHQUFHLEdBQUcsQ0FBQyxDQUFjLFNBQVM7UUFDckMsWUFBTyxHQUFHLEdBQUcsQ0FBQyxDQUFjLFlBQVk7UUFFeEMsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFpQixTQUFTO1FBQ3JDLG1EQUFtRDtRQUNuRCxlQUFVLEdBQXNCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLHlCQUFvQixHQUF5QixJQUFJLENBQUM7UUFFbEQscUJBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQWlCLFdBQVc7UUFDakQsYUFBUSxHQUFHLENBQUMsQ0FBQyxDQUEyQixXQUFXO1FBRW5ELFlBQU8sR0FBWSxJQUFJLENBQUMsQ0FBZ0IsaUJBQWlCO1FBRXpELFdBQU0sR0FBRyxzQkFBTSxDQUFDLGdCQUFnQixDQUFDLENBQU0sUUFBUTtRQU0zQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSCxVQUFVLENBQUMsTUFBYyxFQUFFLE9BQWUsRUFBRSxPQUFlO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElB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