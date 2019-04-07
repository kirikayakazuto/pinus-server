"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dispatcher_1 = require("../../../util/dispatcher");
const MysqlCenter_1 = require("../../../database/MysqlCenter");
const DateBaseConfig_1 = require("../../../database/DateBaseConfig");
const authWXServer_1 = require("../../../util/authWXServer");
const RES_1 = require("../../../RES");
function default_1(app) {
    return new GateHandler(app);
}
exports.default = default_1;
class GateHandler {
    constructor(app) {
        this.app = app;
    }
    async getWxOpenid(msg, session) {
        let data = await authWXServer_1.default.httpsGetWX(msg.code, msg.encryptedData, msg.iv);
        if (data.status == true) { // 获得了该玩家的openid
            let userInfo = await this.loginByOpenid(data.data);
            if (!userInfo) {
                return { code: 201, msg: null };
            }
            return { code: RES_1.default.OK, msg: userInfo };
        }
        else {
            return { code: 202, msg: null };
        }
    }
    /**
     * 登录
     * @param userInfo
     */
    async loginByOpenid(userInfo) {
        let openId = userInfo.openId;
        let userArr = await MysqlCenter_1.default.getUserInfoByopenId(openId);
        if (userArr.length <= 0) {
            // 插入一个新玩家
            await MysqlCenter_1.default.insertPlayerByopenId(userInfo);
            userInfo.chip = DateBaseConfig_1.default.mysqlConfig.defaultChip;
            userInfo.exp = DateBaseConfig_1.default.mysqlConfig.defaultExp;
        }
        else { // 将玩家信息返回
            if (userArr[0].can_login != 1) { // 玩家被封号
                console.log("player can not login");
                return;
            }
            await MysqlCenter_1.default.updataUserInfoByOpenId(userInfo);
            userInfo.chip = userArr[0].chip;
            userInfo.exp = userArr[0].exp;
        }
        return userInfo;
    }
    /**
     * Gate handler that dispatch user to connectors.
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param {Function} next next stemp callback
     *
     */
    async queryEntry(msg, session) {
        if (!msg.code || !msg.encryptedData || !msg.iv) {
            return { code: 301, msg: null };
        }
        let wxResult = await this.getWxOpenid(msg, session);
        if (!wxResult.code || wxResult.code != 200) {
            return { code: 203, msg: null };
        }
        // get all connectors
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            return { code: 401, msg: null };
        }
        // select connector
        let res = dispatcher_1.dispatch(wxResult.msg.openId, connectors);
        return {
            code: RES_1.default.OK,
            msg: {
                host: res.host,
                port: res.clientPort,
                userInfo: wxResult.msg
            }
        };
    }
}
exports.GateHandler = GateHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2hhbmRsZXIvZ2F0ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBb0Q7QUFFcEQsK0RBQXdEO0FBRXhELHFFQUE4RDtBQUM5RCw2REFBc0Q7QUFFdEQsc0NBQStCO0FBRS9CLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQUVEO0lBQ0ksWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFzRCxFQUFFLE9BQXVCO1FBQzdGLElBQUksSUFBSSxHQUFtQyxNQUFNLHNCQUFZLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUcsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRSxFQUFJLGdCQUFnQjtZQUN4QyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ1YsT0FBUSxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFBO2FBQ2pDO1lBQ0QsT0FBUSxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUMsQ0FBQTtTQUN4QzthQUFLO1lBQ0YsT0FBUSxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFBO1NBQ2pDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtB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