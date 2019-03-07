"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 封装的玩家对象
 */
class Player {
    constructor(openId, session) {
        this.openId = "";
        this.session = null;
        this.playerInfo = null; // 玩家信息
        this.areaId = -1; // 区间id
        this.roomId = -1; // 房间id
        this.openId = openId;
        this.session = session;
    }
    /**
     * 初始化玩家信息
     */
    initPlayerInfo(playerInfo) {
        this.playerInfo = playerInfo;
    }
    /**
     * 进入区间
     */
    enterArea(areaId) {
        this.areaId = areaId;
    }
    /**
     * 进入房间
     */
    enterRoom(roomId) {
        this.roomId = roomId;
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL2RvbWFpbi9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7R0FFRztBQUNIO0lBRUksWUFBWSxNQUFjLEVBQUUsT0FBdUI7UUFLbkQsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixZQUFPLEdBQW1CLElBQUksQ0FBQztRQUUvQixlQUFVLEdBQWEsSUFBSSxDQUFDLENBQUksT0FBTztRQUUvQixXQUFNLEdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBWSxPQUFPO1FBQ3ZDLFdBQU0sR0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFZLE9BQU87UUFWM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQVNEOztPQUVHO0lBQ0gsY0FBYyxDQUFDLFVBQW9CO1FBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFDRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFjO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFDRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFjO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7Q0FDSjtBQWhDRCx5QkFnQ0MifQ==