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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWxDZW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGF0YWJhc2UvTXlzcWxDZW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBOEI7QUFDOUIsNkJBQTZCO0FBRTdCLDhDQUF1QztBQUd2QztJQUdJLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxPQUFlLEVBQUUsS0FBYSxFQUFFLElBQVk7UUFDM0YsV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ3BDLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLElBQUk7WUFDVixRQUFRLEVBQUUsT0FBTztZQUNqQixJQUFJLEVBQUUsS0FBSztZQUNYLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUF5QkQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxNQUFjO1FBQzlDLElBQUksR0FBRyxHQUFHLHdJQUF3SSxDQUFDO1FBQ25KLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEIsT0FBTyxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUNEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYztRQUMzQyxJQUFJLEdBQUcsR0FBRywwRUFBMEUsQ0FBQztRQUNyRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBCLE9BQU8sTUFBTSxXQUFXLENBQUMsU0FBUyxD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