"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MysqlCenter_1 = require("../../../database/MysqlCenter");
const res_1 = require("../../../res");
/**
 * 负责承载连接, 并发请求转发到后端的服务器群
 *
 * 邓朗 2019/03/01
 */
function default_1(app) {
    return new EntryHandler(app);
}
exports.default = default_1;
class EntryHandler {
    constructor(app) {
        this.app = app;
        this.onlinePlayerList = {}; // 在线玩家列表
        this.matchPlayerList = {}; // 开启匹配玩家列表
    }
    /**
     * 玩家进入connector服务器
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next stemp callback
     * @return {Void}
     */
    async enter(msg, session) {
        if (!msg || !msg.openId) {
            return { code: res_1.default.ERR_PARAM, msg: null };
        }
        let resMysql = await MysqlCenter_1.default.isExistOpenid(msg.openId);
        if (!resMysql || resMysql.length <= 0 || resMysql[0].can_login != 1) {
            return { code: res_1.default.ERR_NOT_LOGIN, msg: null };
        }
        let sessionService = this.app.get('sessionService');
        if (!!sessionService.getByUid(msg.openId)) {
            return { code: res_1.default.ERR_IS_LOGIN, msg: null };
        }
        await session.abind(msg.openId);
        this.onlinePlayerList[msg.openId] = session; // 添加在线用户
        session.on('closed', this.onUserLeave.bind(this));
        return {
            code: res_1.default.OK,
            msg: {}
        };
    }
    /**
     * 开始匹配玩家
     */
    async addMatchOnlinePlayer(msg, session) {
        if (!msg || !msg.roomType) {
            return { code: res_1.default.ERR_PARAM, msg: null };
        }
        let openId = session.uid;
        if (!openId) {
            return { code: res_1.default.ERR_NOT_LOGIN, msg: null };
        }
        if (this.matchPlayerList[openId]) {
            return { code: res_1.default.ERR_IS_IN_MASTH_LIST, msg: null };
        }
        this.matchPlayerList[openId] = session;
        return { code: res_1.default.OK, msg: { MatchPlayer: true } };
    }
    /**
     * 删除正在匹配的玩家
     */
    async removeMatchOnlinePlayer(msg, session) {
        if (!msg || !msg.roomType) {
            return { code: res_1.default.ERR_PARAM, msg: null };
        }
        let openId = session.uid;
        if (!openId) {
            return { code: res_1.default.ERR_NOT_LOGIN, msg: null };
        }
        if (!this.matchPlayerList[openId]) {
            return { code: res_1.default.ERR_NOT_IN_MASTH_LIST, msg: null };
        }
        this.matchPlayerList[openId] = null;
        delete this.matchPlayerList[openId];
        return { code: res_1.default.OK, msg: { MatchPlayer: false } };
    }
    /**
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer() {
        for (let key in this.matchPlayerList) {
            // this.matchPlayerList[key]
        }
    }
    /**
     * User log out handler
     *
     * @param {Object} app current application
     * @param {Object} session current session object
     *
     */
    onUserLeave(session) {
        if (!session || !session.uid) {
            return;
        }
        // 退出匹配列表
        if (this.matchPlayerList[session.uid]) {
            this.matchPlayerList[session.uid] = null;
            delete this.matchPlayerList[session.uid];
        }
        this.onlinePlayerList[session.uid] = null;
        delete this.onlinePlayerList[session.uid];
        return { code: res_1.default.OK, msg: {} };
        // this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get('serverId'), session.get('rid'));
    }
}
exports.EntryHandler = EntryHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQXdEO0FBQ3hELHNDQUErQjtBQUcvQjs7OztHQUlHO0FBQ0gsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUZELDRCQUVDO0FBRUQ7SUFDSSxZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBR3BDLHFCQUFnQixHQUF3QyxFQUFFLENBQUMsQ0FBSyxTQUFTO1FBRXpFLG9CQUFlLEdBQXdDLEVBQUUsQ0FBQyxDQUFNLFdBQVc7SUFKM0UsQ0FBQztJQU9EOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQXFCLEVBQUUsT0FBd0I7UUFDdkQsSUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDcEIsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzQztRQUVELElBQUksUUFBUSxHQUFRLE1BQU0scUJBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLElBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7WUFDaEUsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMvQztRQUVELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFn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