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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQXdEO0FBQ3hELHNDQUErQjtBQUcvQjs7OztHQUlHO0FBQ0gsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUZELDRCQUVDO0FBRUQ7SUFDSSxZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBR3BDLHFCQUFnQixHQUF3QyxFQUFFLENBQUMsQ0FBSyxTQUFTO1FBRXpFLG9CQUFlLEdBQXdDLEVBQUUsQ0FBQyxDQUFNLFdBQVc7SUFKM0UsQ0FBQztJQU9EOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQXFCLEVBQUUsT0FBd0I7UUFDdkQsSUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDcEIsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMzQztRQUVELElBQUksUUFBUSxHQUFRLE1BQU0scUJBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLElBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7WUFDaEUsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUMvQztRQUVELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkMsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUM5QztRQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBSSxTQUFTO1FBRXpELE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEQsT0FBTztZQUNILElBQUksRUFBRSxhQUFHLENBQUMsRUFBRTtZQUNaLEdBQUcsRUFBRSxFQUFFO1NBQ1YsQ0FBQTtJQUNMLENBQUM7SUFPRDs7Ozs7O09BTUc7SUFDSCxXQUFXLENBQUMsT0FBd0I7UUFDaEMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDMUIsT0FBTztTQUNWO1FBRUQsU0FBUztRQUNULElBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUMvQixxSEFBcUg7SUFDekgsQ0FBQztDQUNKO0FBekVELG9DQXlFQyJ9