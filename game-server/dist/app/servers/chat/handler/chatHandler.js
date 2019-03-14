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
        let player = this.matchPlayerList[openId];
        if (!player) {
            return { code: RES_1.default.ERR_NOT_IN_MASTH_LIST, msg: null };
        }
        if (player.roomId) { // 判断这个玩家是否已经进入了房间
            this.playerQuitRoom(player);
        }
        this.matchPlayerList[openId] = null;
        delete this.matchPlayerList[openId];
        return { code: RES_1.default.OK, msg: { MatchPlayer: false } };
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
            }
        }
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
        /* let rid = session.get('rid');
        let username = session.uid.split('*')[0];
        let channelService = this.app.get('channelService');
        let param = {
            msg: msg.content,
            from: username,
            target: msg.target
        };
        let channel = channelService.getChannel(rid, false);

        // the target is all users
        if (msg.target === '*') {
            channel.pushMessage('onChat', param);
        }
        // the target is specific user
        else {
            let tuid = msg.target + '*' + rid;
            let tsid = channel.getMember(tuid)['sid'];
            channelService.pushMessageByUids('onChat', param, [{
                uid: tuid,
                sid: tsid
            }]);
        } */
    }
}
exports.ChatHandler = ChatHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrREFBd0Q7QUFDeEQsc0NBQStCO0FBQy9CLDJEQUFvRDtBQUNwRCx1REFBZ0Q7QUFDaEQsb0RBQTZDO0FBQzdDLCtDQUF3QztBQUV4QyxNQUFNLFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsQ0FBQztBQUV6QyxtQkFBd0IsR0FBZ0I7SUFDcEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsV0FBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFKRCw0QkFJQztBQUVEO0lBQ0ksWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUdwQzs7V0FFRztRQUNILHFCQUFnQixHQUFtQyxFQUFFLENBQUM7UUFDdEQ7O1dBRUc7UUFDSCxvQkFBZSxHQUFtQyxFQUFFLENBQUM7UUFFckQ7O1dBRUc7UUFDSCxhQUFRLEdBQWlDLEVBQUUsQ0FBQztJQWQ1QyxDQUFDO0lBZ0JEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEdBQXVCLEVBQUUsT0FBdUI7UUFDdkUsSUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzQztRQUVELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNSLE9B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