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
    return new ChatHandler(app);
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
        console.log("=========in");
        if (!msg || !msg.roomType) {
            return { code: RES_1.default.ERR_PARAM, msg: null };
        }
        let openId = session.uid;
        if (!openId) {
            return { code: RES_1.default.ERR_NOT_LOGIN, msg: null };
        }
        if (this.matchPlayerList[openId]) {
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
        if (!this.matchPlayerList[openId]) {
            return { code: RES_1.default.ERR_NOT_IN_MASTH_LIST, msg: null };
        }
        this.matchPlayerList[openId] = null;
        delete this.matchPlayerList[openId];
        return { code: RES_1.default.OK, msg: { MatchPlayer: false } };
    }
    /**
     * 显示匹配到的玩家信息
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer(areaId) {
        for (let key in this.matchPlayerList) {
            let player = this.matchPlayerList[key];
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
        return room;
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
        let player = await this.allocPlayer(session.uid);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrREFBd0Q7QUFDeEQsc0NBQStCO0FBQy9CLDJEQUFvRDtBQUNwRCx1REFBZ0Q7QUFDaEQsb0RBQTZDO0FBQzdDLCtDQUF3QztBQUV4QyxNQUFNLFVBQVUsR0FBRyxvQkFBVSxDQUFDLFVBQVUsQ0FBQztBQUV6QyxtQkFBd0IsR0FBZ0I7SUFDcEMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRDtJQUNJLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFHcEM7O1dBRUc7UUFDSCxxQkFBZ0IsR0FBbUMsRUFBRSxDQUFDO1FBQ3REOztXQUVHO1FBQ0gsb0JBQWUsR0FBbUMsRUFBRSxDQUFDO1FBRXJEOztXQUVHO1FBQ0gsYUFBUSxHQUFpQyxFQUFFLENBQUM7SUFkNUMsQ0FBQztJQWdCRDs7T0FFRztJQUNILEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxHQUF1QixFQUFFLE9BQXVCO1FBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0IsSUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzQztRQUVELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBRyxDQUFDLE1BQU0sRUFBRTtZQUNSLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFH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