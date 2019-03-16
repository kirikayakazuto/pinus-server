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