"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class AreaPlayer {
    constructor(openId) {
        this.openId = ""; // openId, 玩家的唯一标识
        this.playerInfo = null; // 玩家信息
        this.serverId = ""; // 服务器id
        this.areaId = -1; // 区间号
        this.roomId = ""; // 房间号
        this.seatId = -1; // 座位号
        this.eventEmitter = new events_1.EventEmitter(); // 事件监听, 发送
        this.openId = openId;
    }
    initInfo(playerInfo) {
        this.playerInfo = playerInfo;
    }
    /**
     * 进入区间
     */
    enterArea(areaId, serverId) {
        this.areaId = areaId;
        this.serverId = serverId;
    }
    quitArea() {
        this.areaId = -1;
    }
    /**
     * 进入房间
     * @param roomId
     */
    enterRoom(roomId) {
        this.roomId = roomId;
    }
    quitRoom() {
        this.roomId = null;
    }
}
exports.default = AreaPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoYXQvYXJlYVBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLG1DQUFtQztBQUVuQztJQWFJLFlBQVksTUFBYztRQVoxQixXQUFNLEdBQUcsRUFBRSxDQUFDLENBQW9CLGtCQUFrQjtRQUVsRCxlQUFVLEdBQWEsSUFBSSxDQUFDLENBQU0sT0FBTztRQUV6QyxhQUFRLEdBQUcsRUFBRSxDQUFDLENBQWtCLFFBQVE7UUFFeEMsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQW9CLE1BQU07UUFDdEMsV0FBTSxHQUFHLEVBQUUsQ0FBQyxDQUFvQixNQUFNO1FBQ3RDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFvQixNQUFNO1FBRXRDLGlCQUFZLEdBQWlCLElBQUkscUJBQVksRUFBRSxDQUFDLENBQUksV0FBVztRQUczRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsUUFBUSxDQUFDLFVBQW9CO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFDRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7UUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUNELFFBQVE7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFDRDs7O09BR0c7SUFDSCxTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBQ0QsUUFBUTtRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQXhDRCw2QkF3Q0MifQ==