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
        this.onlinePlayerList[session.uid] = null;
        delete this.onlinePlayerList[session.uid];
        return { code: res_1.default.OK, msg: {} };
        // this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get('serverId'), session.get('rid'));
    }
}
exports.EntryHandler = EntryHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQXdEO0FBQ3hELHNDQUErQjtBQUcvQjs7OztHQUlHO0FBQ0gsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUZELDRCQUVDO0FBRUQ7SUFDSSxZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBR3BDLHFCQUFnQixHQUF3QyxFQUFFLENBQUMsQ0FBSyxTQUFTO0lBRnpFLENBQUM7SUFJRDs7Ozs7OztPQU9HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFxQixFQUFFLE9BQXdCO1FBQ3ZELElBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1lBQ3BCLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDM0M7UUFFRCxJQUFJLFFBQVEsR0FBUSxNQUFNLHFCQUFXLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRSxJQUFHLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFO1lBQ2hFLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDL0M7UUFFRCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDOUM7UUFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUksU0FBUztRQUV6RCxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWxELE9BQU87WUFDSCxJQUFJLEVBQUUsYUFBRyxDQUFDLEVBQUU7WUFDWixHQUFHLEVBQUUsRUFBRTtTQUNWLENBQUE7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsV0FBVyxDQUFDLE9BQXdCO1FBQ2hDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQzFCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQyxPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQyxDQUFDO1FBQy9CLHFIQUFxSDtJQUN6SCxDQUFDO0NBQ0o7QUEzREQsb0NBMkRDIn0=