"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const util = require("util");
const gameConfig_1 = require("../gameConfig");
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
MysqlCenter.connectToCenter(gameConfig_1.default.centerDatabase.host, gameConfig_1.default.centerDatabase.port, gameConfig_1.default.centerDatabase.db_name, gameConfig_1.default.centerDatabase.uname, gameConfig_1.default.centerDatabase.upwd);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWxDZW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGF0YWJhc2UvTXlzcWxDZW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBOEI7QUFDOUIsNkJBQTZCO0FBRTdCLDhDQUF1QztBQUl2QztJQUdJLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBYSxFQUFFLElBQVk7UUFDM0YsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ3BDLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLElBQUk7WUFDVixRQUFRLEVBQUUsT0FBTztZQUNqQixJQUFJLEVBQUUsS0FBSztZQUNYLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUF5QkQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxNQUFjO1FBQzlDLElBQUksR0FBRyxHQUFHLHdJQUF3SSxDQUFDO1FBQ25KLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEIsT0FBTyxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUNEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYztRQUMzQyxJQUFJLEdBQUcsR0FBRywwRUFBMEUsQ0FBQztRQUNyRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBCLE9BQU8sTUFBTSxXQUFXLENBQUMsU0FBUyxD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