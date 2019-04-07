"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameInterface_1 = require("../gameInterface");
const events_1 = require("events");
const MysqlCenter_1 = require("../database/MysqlCenter");
class AreaPlayer {
    constructor(openId) {
        this.openId = ""; // openId, 玩家的唯一标识
        this.playerInfo = null; // 玩家信息
        this.serverId = ""; // 服务器id
        this.areaId = -1; // 区间号
        this.roomId = null; // 房间号
        this.seatId = -1; // 座位号
        this.state = gameInterface_1.Status.NotInRoom; // 玩家状态
        this.isWin = 0; // 0表示未知, -1表示输了, 1表示赢了
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
        this.state = gameInterface_1.Status.InView;
        this.roomId = roomId;
    }
    quitRoom() {
        this.state = gameInterface_1.Status.NotInRoom;
        this.roomId = null;
    }
    sitDown(seatId) {
        this.state = gameInterface_1.Status.OnTheSeat;
        this.seatId = seatId;
    }
    standUp() {
        this.state = gameInterface_1.Status.InView;
        this.seatId = -1;
    }
    ready() {
        this.state = gameInterface_1.Status.Ready;
    }
    NoReady() {
        this.state = gameInterface_1.Status.OnTheSeat;
    }
    playing() {
        this.state = gameInterface_1.Status.Playing;
    }
    /**
     * 结算游戏
     * 更新玩家的金币数目
     * 增加经验值
     */
    async checkOutGame(betChip, expAddNum) {
        this.state = gameInterface_1.Status.CheckOut;
        await MysqlCenter_1.default.updataUserChipByOpenId(this.openId, betChip);
        await MysqlCenter_1.default.updateUserExpByOpenId(this.openId, expAddNum);
    }
    /**
     * 游戏结束了, 清除过时数据
     */
    checkOutOver() {
        this.roomId = null;
        this.seatId = -1;
        this.state = gameInterface_1.Status.NotInRoom;
        this.isWin = 0;
    }
}
exports.default = AreaPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9kb21haW4vYXJlYVBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUFvRDtBQUNwRCxtQ0FBbUM7QUFFbkMseURBQWtEO0FBRWxEO0lBZ0JJLFlBQVksTUFBYztRQWYxQixXQUFNLEdBQUcsRUFBRSxDQUFDLENBQW9CLGtCQUFrQjtRQUVsRCxlQUFVLEdBQWEsSUFBSSxDQUFDLENBQU0sT0FBTztRQUV6QyxhQUFRLEdBQUcsRUFBRSxDQUFDLENBQWtCLFFBQVE7UUFFeEMsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQW9CLE1BQU07UUFDdEMsV0FBTSxHQUFXLElBQUksQ0FBQyxDQUFvQixNQUFNO1FBQ2hELFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUF3QixNQUFNO1FBQzFDLFVBQUssR0FBVyxzQkFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFHLE9BQU87UUFFM0MsVUFBSyxHQUFHLENBQUMsQ0FBQyxDQUFrQix1QkFBdUI7UUFFbkQsaUJBQVksR0FBaUIsSUFBSSxxQkFBWSxFQUFFLENBQUMsQ0FBSSxXQUFXO1FBRzNELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxRQUFRLENBQUMsVUFBb0I7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsU0FBUyxDQUFDLE1BQWMsRUFBRSxRQUFnQjtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBQ0QsUUFBUTtRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxNQUFjO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsc0JBQU0sQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUNELFFBQVE7UUFDSixJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFNLENBQUMsU0FBUyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPLENBQUMsTUFBYztRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFNLENBQUMsU0FBUyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxPQUFPO1FBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBTSxDQUFDLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBQ0QsT0FBTztRQUNILElBQUksQ0FBQyxLQUFLLEdBQUcsc0JBQU0sQ0FBQyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFlLEVBQUUsU0FBaUI7UUFDakQsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBTSxDQUFDLFFBQVEsQ0FBQztRQUM3QixNQUFNLHFCQUFXLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxNQUFNLHFCQUFXLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFNLENBQUMsU0FBUyxDQUFBO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQXBGRCw2QkFvRkMifQ==