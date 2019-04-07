"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const util = require("util");
const DateBaseConfig_1 = require("./DateBaseConfig");
const utils_1 = require("../util/utils");
class MysqlCenter {
    static connectToCenter(host, port, db_name, uname, upwd) {
        MysqlCenter.connPool = mysql.createPool({
            host: host,
            port: port,
            database: db_name,
            user: uname,
            password: upwd,
        });
    }
    /**
     * 获取玩家所有信息
     * @param openId
     */
    static async getUserAllInfoByOpenId(openId) {
        let sql = "select openId, nickName, avatarUrl, gender, chip, exp, city, country, province, can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        console.log(sqlCmd);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 通过openId 获取玩家信息
     * @param openId
     */
    static async getUserInfoByopenId(openId) {
        let sql = "select chip, exp, can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        console.log(sqlCmd);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 插入玩家信息
     * @param userInfo
     */
    static async insertPlayerByopenId(userInfo) {
        let sql = "insert into user_info(`openId`, `nickName`, `avatarUrl`, `gender`, `city`, `country`, `province`, `can_login`)values(\"%s\", \"%s\", \"%s\", %d, \"%s\", \"%s\", \"%s\", 1)";
        let sqlCmd = util.format(sql, userInfo.openId, userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userInfo.city, userInfo.country, userInfo.province);
        console.log(sqlCmd);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 更新玩家信息
     * @param userInfo
     */
    static async updataUserInfoByOpenId(userInfo) {
        let sql = "update user_info set nickName = \"%s\", avatarUrl = \"%s\", gender = %d, city = \"%s\", country = \"%s\", province = \"%s\" where openId = \"%s\"";
        let sqlCmd = util.format(sql, userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userInfo.city, userInfo.country, userInfo.province, userInfo.openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    static async isExistOpenid(openId) {
        let sql = "select can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 更新玩家的金币信息
     * @param openId
     */
    static async updataUserChipByOpenId(openId, chipNum) {
        let sql = "update user_info set chip = chip + %d where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, chipNum, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 更新玩家的经验
     * @param openId
     * @param addNum
     */
    static async updateUserExpByOpenId(openId, addNum) {
        let sql = "update user_info set exp = exp + %d where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, addNum, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 增加一条游戏记录
     * @param selfPlayer
     * @param otherPlayer
     * @param time
     * @param chip
     * @param exp
     * @param isWin
     * @param dist
     */
    static async insertFightHistory(selfPlayer, otherPlayer, time, chip, exp, selfIsWin, otherIsWin, dist) {
        let sql = "insert into fight_history(`selfOpenId`, `selfNickName`, `otherOpenId`, `otherNickName`, `time`, `chip`, `exp`, `selfIsWin`, `otherIsWin`, `dist`)values(\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", %d, %d, %d, %d, \"%s\")";
        let sqlCmd = util.format(sql, selfPlayer.openId, selfPlayer.playerInfo.nickName, otherPlayer.openId, otherPlayer.playerInfo.nickName, time, chip, exp, selfIsWin, otherIsWin, dist);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 获取游戏历史战绩
     */
    static async getFightHistoryByOpenId(openId) {
    }
    /**
     * --------------------------------------------- 每日登录 ------------------------------------------
     */
    static async getLoginBonuesInfo(openId) {
        let sql = "select bonues, status, bonues_time, days from login_bonues where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    // 今日待领的奖励
    static async insertUserLoginBonues(openId, bonues) {
        let time = utils_1.default.timestamp();
        let sql = "insert into login_bonues(`openId`, `bonues`, `bonues_time`, `days`)values(\"%s\", %d, %d, %d)";
        let sqlCmd = util.format(sql, openId, bonues, time, 1);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    static async updateUserLoginBonuesInfo(openId, bonues, days) {
        let time = utils_1.default.timestamp();
        let sql = "update login_bonues set days = %d, bonues_time = %d, status = 0, bonues = %d where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, days, time, bonues, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    static async updateUserLoginBonuesRecved(openId) {
        let sql = "update login_bonues set status = 1 where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        return await MysqlCenter.mysqlExec(sqlCmd);
    }
}
MysqlCenter.connPool = null;
/**
 * 封装好的查询工具
 */
MysqlCenter.mysqlExec = function (sql) {
    return new Promise((resolve, reject) => {
        MysqlCenter.connPool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            }
            else {
                conn.query(sql, (err, rows) => {
                    if (err) {
                        console.log("err");
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                    conn.release();
                });
            }
        });
    });
};
exports.default = MysqlCenter;
MysqlCenter.connectToCenter(DateBaseConfig_1.default.mysqlConfig.host, DateBaseConfig_1.default.mysqlConfig.port, DateBaseConfig_1.default.mysqlConfig.db_name, DateBaseConfig_1.default.mysqlConfig.uname, DateBaseConfig_1.default.mysqlConfig.upwd);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWxDZW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGF0YWJhc2UvTXlzcWxDZW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBOEI7QUFDOUIsNkJBQTZCO0FBRTdCLHFEQUE4QztBQUU5Qyx5Q0FBa0M7QUFHbEM7SUFHSSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsT0FBZSxFQUFFLEtBQWEsRUFBRSxJQUFZO1FBQzNGLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNwQyxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJO1lBQ1YsUUFBUSxFQUFFLE9BQU87WUFDakIsSUFBSSxFQUFFLEtBQUs7WUFDWCxRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBeUJEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsTUFBYztRQUM5QyxJQUFJLEdBQUcsR0FBRyx3SUFBd0ksQ0FBQztRQUNuSixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBCLE9BQU8sTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFDRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BQWM7UUFDM0MsSUFBSSxHQUFHLEdBQUcsMEVBQTBFLENBQUM7UUFDckYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwQixPQUFPLE1BQU0sV0FB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