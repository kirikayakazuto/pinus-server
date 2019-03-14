"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const RES_1 = require("../RES");
const EventName_1 = require("../EventName");
const gameInterface_1 = require("../gameInterface");
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
     * 开始执行游戏进程
     */
    run() {
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
     * 检查游戏是否可以开始                                             ------------- 将玩家中匹配列表中删除, 因为此时玩家不能再推出匹配列表
     */
    checkGameCanStart() {
        if (this.currentPlayerNum == this.maxNum) {
            this.status = gameInterface_1.Status.CanStartGame;
            this.getChannel().pushMessage(EventName_1.default.onGameCanStart, {
                waitTime: 2,
            });
        }
    }
    /**
     * 玩家可以开始, 准备工作
     */
    doGameCanStart() {
        // 清除
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
     * 添加事件
     */
    addEvent(player) {
        let self = this;
        player.eventEmitter.on("good", () => {
        });
    }
}
exports.default = AreaRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLGdDQUF5QjtBQUN6Qiw0Q0FBcUM7QUFDckMsb0RBQTBDO0FBRTFDOztHQUVHO0FBQ0g7SUFrQkk7O09BRUc7SUFDSCxZQUFZLE1BQWMsRUFBRSxNQUFjO1FBbkIxQyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsT0FBTztRQUNuQyxXQUFNLEdBQUcsRUFBRSxDQUFDLENBQWdCLGtDQUFrQztRQUM5RCxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsU0FBUztRQUNyQyxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsWUFBWTtRQUV4QyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQWlCLFNBQVM7UUFDckMsbURBQW1EO1FBQ25ELGVBQVUsR0FBc0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MseUJBQW9CLEdBQVEsSUFBSSxDQUFDO1FBRWpDLHFCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFpQixXQUFXO1FBRWpELFlBQU8sR0FBWSxJQUFJLENBQUMsQ0FBSSxpQkFBaUI7UUFFN0MsV0FBTSxHQUFHLHNCQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBTSxRQUFRO1FBTTNDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxNQUFjLEVBQUUsT0FBZSxFQUFFLE9BQWU7UUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUVEOztPQUVHO0lB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