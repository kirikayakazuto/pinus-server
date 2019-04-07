"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MysqlCenter_1 = require("../database/MysqlCenter");
const GameServerConfig_1 = require("../GameServerConfig");
const utils_1 = require("../util/utils");
const RES_1 = require("../RES");
/**
 * 每日登录奖励
 * 时间: 2019年4月6日19:16:47
 * 作者: 邓朗
 */
class loginBonues {
    /**
     * 检查玩家是否需不需要领取每日奖励
     * @param player
     */
    static async checkHasLoginBonues(player) {
        let arr = await MysqlCenter_1.default.getLoginBonuesInfo(player.openId);
        if (!arr || arr.length <= 0) { // 数据库没有这个用户, 创建一个
            await MysqlCenter_1.default.insertUserLoginBonues(player.openId, GameServerConfig_1.default.loginBonues.bonues[0]);
            return { code: RES_1.default.OK, msg: null };
        }
        let loginBonuesInfo = arr[0];
        if (!loginBonuesInfo)
            return { code: RES_1.default.ERR_SYSTEM, msg: "don have loginUserInfo" };
        let hasBonues = loginBonuesInfo.bonues_time < utils_1.default.timestamp_today();
        if (!hasBonues)
            return { code: RES_1.default.OK, msg: "时间戳不对" };
        let days = 1;
        let isStraight = loginBonuesInfo.bonues_time >= utils_1.default.timestamp_yesterday();
        if (isStraight)
            days = loginBonuesInfo.days + 1;
        let index = days - 1; // 奖励索引
        if (days > GameServerConfig_1.default.loginBonues.bonues.length) {
            if (GameServerConfig_1.default.loginBonues.clearLoginStraight) {
                days = 1;
                index = 0;
            }
            else {
                index = GameServerConfig_1.default.loginBonues.bonues.length - 1;
            }
        }
        await MysqlCenter_1.default.updateUserLoginBonuesInfo(player.openId, GameServerConfig_1.default.loginBonues.bonues[index], days);
        return { code: RES_1.default.OK, msg: {} };
    }
    static async getLoginBonuesInfo(player) {
        let arr = await MysqlCenter_1.default.getLoginBonuesInfo(player.openId);
        if (!arr || arr.length <= 0)
            return { code: RES_1.default.ERR_SYSTEM, msg: "没有获取到arr" };
        let bonuesInfo = arr[0];
        if (bonuesInfo.status != 0)
            return { code: RES_1.default.ERR_SYSTEM, msg: "已经领取过了" };
        return { code: RES_1.default.OK, msg: {
                bonues: bonuesInfo.bonues,
                days: bonuesInfo.days,
            } };
    }
    static async getLoginBonuesResult(player) {
        let arr = await MysqlCenter_1.default.getLoginBonuesInfo(player.openId);
        if (!arr || arr.length <= 0)
            return { code: RES_1.default.ERR_SYSTEM, msg: "" };
        let bonuesInfo = arr[0];
        if (bonuesInfo.status != 0)
            return { code: RES_1.default.ERR_SYSTEM, msg: null };
        await MysqlCenter_1.default.updateUserLoginBonuesRecved(player.openId);
        // 更新玩家数据
        await MysqlCenter_1.default.updataUserChipByOpenId(player.openId, bonuesInfo.bonues);
        return { code: RES_1.default.OK, msg: {
                bonues: bonuesInfo.bonues,
            } };
    }
}
exports.default = loginBonues;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW5Cb251ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZG9tYWluL2xvZ2luQm9udWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseURBQWtEO0FBRWxELDBEQUFrRDtBQUNsRCx5Q0FBa0M7QUFDbEMsZ0NBQXlCO0FBRXpCOzs7O0dBSUc7QUFDSDtJQUVJOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBa0I7UUFDdEQsSUFBSSxHQUFHLEdBQVEsTUFBTSxxQkFBVyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRSxJQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLEVBQUcsa0JBQWtCO1lBQzdDLE1BQU0scUJBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLDBCQUFnQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxlQUFlLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUcsQ0FBQyxlQUFlO1lBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBQyxDQUFDO1FBRWxGLElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQyxXQUFXLEdBQUcsZUFBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3RFLElBQUcsQ0FBQyxTQUFTO1lBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxhQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQztRQUNuRCxJQUFJLElBQUksR0FBRyxDQUFDLENB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