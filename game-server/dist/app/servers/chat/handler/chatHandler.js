"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MysqlCenter_1 = require("../../../database/MysqlCenter");
const RES_1 = require("../../../RES");
const areaPlayer_1 = require("../../../domain/areaPlayer");
const areaRoom_1 = require("../../../domain/areaRoom");
const gameConfig_1 = require("../../../gameConfig");
const utils_1 = require("../../../util/utils");
const gameInterface_1 = require("../../../gameInterface");
const roomConfig = gameConfig_1.default.roomConfig;
function default_1(app) {
    let chat = new ChatHandler(app);
    setInterval(chat.allocRoomToMatchPlayer.bind(chat), 500, 1);
    return chat;
}
exports.default = default_1;
class ChatHandler {
    constructor(app) {
        this.app = app;
        /**
         * 在线玩家列表
         */
        this.onlinePlayerList = {};
        /**
         * 匹配玩家列表
         */
        this.matchPlayerList = {};
        /**
         * 开启的房间列表
         */
        this.roomList = {};
    }
    /**
     * 开始匹配玩家
     */
    async addMatchOnlinePlayer(msg, session) {
        if (!msg || !msg.roomType) {
            return { code: RES_1.default.ERR_PARAM, msg: null };
        }
        let openId = session.uid;
        if (!openId) {
            return { code: RES_1.default.ERR_NOT_LOGIN, msg: null };
        }
        // 判断用户是否在服务器中
        if (!this.onlinePlayerList[openId]) {
            return { code: RES_1.default.ERR_PARAM, msg: null };
        }
        if (this.matchPlayerList[openId]) { //玩家已经在匹配列表
            return { code: RES_1.default.ERR_IS_IN_MASTH_LIST, msg: null };
        }
        this.matchPlayerList[openId] = this.onlinePlayerList[openId];
        return { code: RES_1.default.OK, msg: { MatchPlayer: true } };
    }
    /**
     * 删除正在匹配的玩家
     */
    async removeMatchOnlinePlayer(msg, session) {
        if (!msg || !msg.roomType) {
            return { code: RES_1.default.ERR_PARAM, msg: null };
        }
        let openId = session.uid;
        if (!openId) {
            return { code: RES_1.default.ERR_NOT_LOGIN, msg: null };
        }
        let player = this.onlinePlayerList[openId];
        if (!player) {
            return { code: RES_1.default.ERR_NOT_IN_MASTH_LIST, msg: null };
        }
        if (player.roomId) { // 判断这个玩家是否已经进入了房间
            this.playerQuitRoom(player);
        }
        else {
            this.removePlayerFromMatchList(player);
        }
        return { code: RES_1.default.OK, msg: { MatchPlayer: false } };
    }
    /**
     * 玩家进入游戏场景
     * @param msg
     * @param session
     */
    async enterGameScene(msg, session) {
        let result = this.authPlayerIsInRoom(session.uid);
        if (result.code != RES_1.default.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;
        room.enterGameScene(player);
        return { code: RES_1.default.OK, msg: {} };
    }
    /**
     * 在帧同步期间收到
     * @param msg
     * @param session
     */
    async ReceivedPlayerCommand(msg, session) {
        let result = this.authPlayerIsInRoom(session.uid);
        if (result.code != RES_1.default.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;
        if (room.status == gameInterface_1.Status.Playing) {
            room.addAction(msg, player.seatId);
            return { code: RES_1.default.OK, msg: {} };
        }
        return { code: RES_1.default.ERR_SYSTEM, msg: {} };
    }
    async gameOver(msg, session) {
        let result = this.authPlayerIsInRoom(session.uid);
        if (result.code != RES_1.default.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;
        await room.gameOver(msg, player.seatId);
        return { code: RES_1.default.OK, msg: { playerSeatId: player.seatId, msg: msg } };
    }
    /**
     * 验证玩家是否在房间
     */
    authPlayerIsInRoom(openId) {
        if (!openId) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        let player = this.onlinePlayerList[openId];
        if (!player) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        if (player.roomId == "" || player.seatId == -1) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        let room = this.roomList[player.roomId];
        if (!room) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        return { code: RES_1.default.OK, msg: { player: player, room: room } };
    }
    /**
     * 玩家退出房间
     * @param player
     */
    playerQuitRoom(player) {
        let room = this.roomList[player.roomId];
        if (!room) {
            return;
        }
        room.playerQuit(player);
    }
    /**
     * 显示匹配到的玩家信息
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer(areaId) {
        for (let key in this.matchPlayerList) {
            let player = this.matchPlayerList[key];
            if (player.roomId) {
                continue;
            }
            let room = this.doSearchRoom(areaId);
            if (player && room) {
                room.playerEnter(player);
                this.removePlayerFromMatchList(player);
            }
        }
    }
    /**
     * 从匹配列表删除玩家
     */
    removePlayerFromMatchList(player) {
        if (!this.matchPlayerList[player.openId]) {
            return;
        }
        this.matchPlayerList[player.openId] = null;
        delete this.matchPlayerList[player.openId];
    }
    /**
     * 获取一个随机字符串作为房间ID
     */
    getRandomRoomId() {
        return utils_1.default.random_string(16);
    }
    /**
     * 寻找一个房间
     */
    doSearchRoom(areaId) {
        for (let key in this.roomList) {
            let room = this.roomList[key];
            if (room.currentPlayerNum < room.maxNum) {
                return room; // 这个房间是合适的房间
            }
        }
        // 没有合适的房间
        let roomId = this.getRandomRoomId();
        return this.doAllocRoom(roomId, areaId);
    }
    /**
     * 分配房间
     */
    doAllocRoom(roomId, areaId) {
        let room = new areaRoom_1.default(areaId, roomId); // 有可能报错, 无areaId 玩家强行登入
        room.initConfig(roomConfig.maxNum, roomConfig.minChip, roomConfig.betChip); // 测试数据, 正式数据应当写在json文件中
        this.roomList[roomId] = room;
        return room;
    }
    /**
     * 删除一个房间
     */
    doDeleteRoom(roomId, areaId) {
        let room = this.roomList[roomId];
        if (!room) { // 没有这个房间
            return false;
        }
        if (!room.clearRoom()) {
            return false;
        }
        return true;
    }
    /**
     * 分配一个玩家
     */
    async allocPlayer(openId) {
        let player = new areaPlayer_1.default(openId);
        let playerInfo = await MysqlCenter_1.default.getUserAllInfoByOpenId(openId);
        if (playerInfo.length <= 0) { // 没有这个玩家
            return null;
        }
        player.initInfo(playerInfo[0]);
        return player;
    }
    /**
     * 玩家移动
     * @param msg
     * @param session
     */
    async move(msg, session) {
    }
    /**
     * 进入游戏区间
     */
    async entryArea(msg, session) {
        let openId = session.uid;
        if (!openId) {
            return { code: RES_1.default.ERR_NOT_LOGIN, msg: null };
        }
        let player = await this.allocPlayer(openId);
        if (!player) {
            return { code: RES_1.default.ERR_NOT_OPENID, msg: null };
        }
        if (this.onlinePlayerList[player.openId]) { // 玩家已经在游戏服务器 内了
            return { code: RES_1.default.ERR_AREA_PLAYER_LIST, msg: null };
        }
        this.onlinePlayerList[player.openId] = player;
        player.enterArea(msg.areaId, session.frontendId);
        return { code: RES_1.default.OK, msg: {} };
    }
    /**
     * Send messages to users
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param  {Function} next next stemp callback
     *
     */
    async send(msg, session) {
    }
}
exports.ChatHandler = ChatHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrREFBd0Q7QUFDeEQsc0NBQStCO0FBQy9CLDJEQUFvRDtBQUNwRCx1REFBZ0Q7QUFDaEQsb0RBQTZDO0FBQzdDLCtDQUF3QztBQUd4QywwREFBZ0Q7QUFFaEQsTUFBTSxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxVQUFVLENBQUM7QUFFekMsbUJBQXdCLEdBQWdCO0lBQ3BDLElBQUksSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBSkQsNEJBSUM7QUFFRDtJQUNJLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFHcEM7O1dBRUc7UUFDSCxxQkFBZ0IsR0FBbUMsRUFBRSxDQUFDO1FBQ3REOztXQUVHO1FBQ0gsb0JBQWUsR0FBbUMsRUFBRSxDQUFDO1FBRXJEOztXQUVHO1FBQ0gsYUFBUSxHQUFpQyxFQUFFLENBQUM7SUFkNUMsQ0FBQztJQWdCRDs7T0FFRztJQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxHQUF1QixFQUFFLE9BQXVCO1FBQ3ZFLElBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDM0M7UUFFRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3pCLElBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDUixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO1NBQy9DO1FBQ0QsY0FBYztRQUNkLElBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0IsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQTtTQUMxQztRQUVELElBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFPLFdBQVc7WUFDL0MsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFBO1NBQ3JEO1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFN0QsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsRUFBQyxDQUFBO0lBQ25ELENBQUM7SUFDRDs7T0FFRztJQUNILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUF1QixFQUFFLE9BQXVCO1FBQzFFLElBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO1lBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDM0M7UUFFRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3pCLElBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDUixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDUixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUE7U0FDdEQ7UUFFRCxJQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRyxrQkFBa0I7WUFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjthQUFLO1lBQ0YsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUMsRUFBQyxDQUFBO0lBQ3BELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFvQixFQUFFLE9BQXVCO1FBQzlELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEQsSUFBRyxNQUFNLENBQUMsSUFBSSxJQUFJLGFBQUcsQ0FBQyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUUzQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVCLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMscUJBQXFCLENBQUMsR0FBVyxFQUFFLE9BQXVCO1FBQzVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEQsSUFBRyxNQUFNLENBQUMsSUFBSSxJQUFJLGFBQUcsQ0FBQyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUUzQixJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksc0JBQU0sQ0FBQyxPQUFPLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUE7U0FDakM7UUFDRCxPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVEsRUFBRSxPQUF1QjtRQUM1QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxhQUFHLENBQUMsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFM0IsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFeEMsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUMsRUFBQyxDQUFBO0lBQ3ZFLENBQUM7SUFDRDs7T0FFRztJQUNILGtCQUFrQixDQUFDLE1BQWM7UUFDN0IsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNSLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUE7U0FDM0M7UUFFRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNSLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUE7U0FDM0M7UUFFRCxJQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQTtTQUMzQztRQUVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDTixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFBO1NBQzNDO1FBRUQsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxNQUFrQjtRQUM3QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFHLENBQUMsSUFBSSxFQUFFO1lBQ04sT0FBUTtTQUNYO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFzQixDQUFDLE1BQWM7UUFDakMsS0FBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkMsSUFBRyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNkLFNBQVM7YUFDWjtZQUNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsSUFBRyxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQztTQUNKO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0gseUJBQXlCLENBQUMsTUFBa0I7UUFDeEMsSUFBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3JDLE9BQVE7U0FDWDtRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMzQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRDs7T0FFRztJQUNILGVBQWU7UUFDWCxPQUFPLGVBQUssQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLE1BQWM7UUFDdkIsS0FBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzFCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDcEMsT0FBTyxJQUFJLENBQUMsQ0FBNEIsYUFBYTthQUN4RDtTQUNKO1FBRUQsVUFBVTtRQUNWLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVcsQ0FBQyxNQUFjLEVBQUUsTUFBYztRQUN0QyxJQUFJLElBQUksR0FBRyxJQUFJLGtCQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUksd0JBQXdCO1FBQ3BFLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFlLHdCQUF3QjtRQUNsSCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0Q7O09BRUc7SUFDSCxZQUFZLENBQUMsTUFBYyxFQUFFLE1BQWM7UUFDdkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxJQUFHLENBQUMsSUFBSSxFQUFFLEVBQUssU0FBUztZQUNwQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELElBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDbEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0Q7O09BRUc7SUFDSCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQWM7UUFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLElBQUksVUFBVSxHQUFRLE1BQU0scUJBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RSxJQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUztZQUNsQyxPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBcUIsRUFBRSxPQUF1QjtJQUV6RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQXFCLEVBQUUsT0FBdUI7UUFDMUQsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN6QixJQUFHLENBQUMsTUFBTSxFQUFFO1lBQ1IsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMvQztRQUNELElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFHLENBQUMsTUFBTSxFQUFFO1lBQ1IsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQTtTQUMvQztRQUVELElBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFTLGdCQUFnQjtZQUM5RCxPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUE7U0FDckQ7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUM5QyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWpELE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUE7SUFDbEMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQXVDLEVBQUUsT0FBdUI7SUFFM0UsQ0FBQztDQUNKO0FBMVJELGtDQTBSQyJ9