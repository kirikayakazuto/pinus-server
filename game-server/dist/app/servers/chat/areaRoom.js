"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const RES_1 = require("../../RES");
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
        this.playerList = {};
        this.actionManagerService = null;
        this.currentPlayerNum = 0; // 房间当前玩家数目
        this.channel = null; // 通道, 用于接收, 发送信息
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
     * @param player
     */
    playerEnter(player) {
        if (this.currentPlayerNum > this.maxNum) {
            return { code: RES_1.default.ERR_ROOM_FULL, msg: null };
        }
        if (this.playerList[player.openId]) {
            return { code: RES_1.default.ERR_PLAYER_IS_IN_ROOM, msg: null };
        }
        this.playerList[player.openId] = player;
        this.currentPlayerNum++;
        player.enterRoom(this.roomId);
        this.getChannel().add(player.openId, player.serverId);
        this.getChannel().pushMessage('onPlayerEnterRoom', {
            playerInfo: player.playerInfo,
        });
        return { code: RES_1.default.OK, msg: {} };
    }
    playerQuit(player) {
        if (!this.playerList[player.openId]) {
            return { code: RES_1.default.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null };
        }
        this.playerList[player.openId] = null;
        delete this.playerList[player.openId];
        this.currentPlayerNum--;
        player.quitRoom();
        return { code: RES_1.default.OK, msg: {} };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2FyZWFSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBRXZDLG1DQUE0QjtBQUU1Qjs7R0FFRztBQUNIO0lBZUk7O09BRUc7SUFDSCxZQUFZLE1BQWMsRUFBRSxNQUFjO1FBaEIxQyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBZ0IsT0FBTztRQUNuQyxXQUFNLEdBQUcsRUFBRSxDQUFDLENBQWdCLGtDQUFrQztRQUM5RCxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsU0FBUztRQUNyQyxZQUFPLEdBQUcsR0FBRyxDQUFDLENBQWMsWUFBWTtRQUV4QyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQWlCLFNBQVM7UUFDckMsZUFBVSxHQUFtQyxFQUFFLENBQUM7UUFDaEQseUJBQW9CLEdBQVEsSUFBSSxDQUFDO1FBRWpDLHFCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFpQixXQUFXO1FBRWpELFlBQU8sR0FBWSxJQUFJLENBQUMsQ0FBSSxpQkFBaUI7UUFNekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0gsVUFBVSxDQUFDLE1BQWMsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxHQUFHO0lBRUgsQ0FBQztJQUNEOzs7T0FHRztJQUNILFVBQVU7UUFDTixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDdkI7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQU8sZUFBZTtRQUNsSCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUNEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxNQUFrQjtRQUMxQixJQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BDLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDL0M7UUFDRCxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQy9CLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUN2RDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUcsQ0FBQztRQUV6QixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQ3pCLG1CQUFtQixFQUNuQjtZQUNJLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtTQUNoQyxDQUNKLENBQUM7UUFFRixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQyxDQUFBO0lBQ2xDLENBQUM7SUFFRCxVQUFVLENBQUMsTUFBa0I7UUFDekIsSUFBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN0QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRyxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVsQixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQyxDQUFBO0lBQ2xDLENBQUM7SUFDRDs7T0FFRztJQUNILFFBQVEsQ0FBQyxNQUFrQjtRQUN2QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUVwQyxDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FJSjtBQXhHRCwyQkF3R0MifQ==