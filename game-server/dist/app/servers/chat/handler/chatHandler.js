"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MysqlCenter_1 = require("../../../database/MysqlCenter");
const RES_1 = require("../../../RES");
const areaPlayer_1 = require("../../../domain/areaPlayer");
const areaRoom_1 = require("../../../domain/areaRoom");
const gameConfig_1 = require("../../../gameConfig");
const utils_1 = require("../../../util/utils");
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
        if (!msg) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        let openId = session.uid;
        let player = this.onlinePlayerList[openId];
        if (!player) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        let room = this.roomList[player.roomId];
        if (!room) {
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        }
        room.enterGameScene(player);
        return { code: RES_1.default.OK, msg: {} };
    }
    async playerMove(msg, session) {
        let openId = session.uid;
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
        room.addAction(msg, player.seatId);
        return { code: RES_1.default.OK, msg: {} };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrREFBd0Q7QUFDeEQsc0NBQStCO0FBQy9CLDJEQUFvRDtBQUNwRCx1REFBZ0Q7QUFDaEQsb0RBQTZDO0FBQzdDLCtDQUF3QztBQUd4QyxNQUFNLFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsQ0FBQztBQUV6QyxtQkFBd0IsR0FBZ0I7SUFDcEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsV0FBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFKRCw0QkFJQztBQUVEO0lBQ0ksWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUdwQzs7V0FFRztRQUNILHFCQUFnQixHQUFtQyxFQUFFLENBQUM7UUFDdEQ7O1dBRUc7UUFDSCxvQkFBZSxHQUFtQyxFQUFFLENBQUM7UUFFckQ7O1dBRUc7UUFDSCxhQUFRLEdBQWlDLEVBQUUsQ0FBQztJQWQ1QyxDQUFDO0lBZ0JEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEdBQXVCLEVBQUUsT0FBdUI7UUFDdkUsSUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzQztRQUVELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNSLE9B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