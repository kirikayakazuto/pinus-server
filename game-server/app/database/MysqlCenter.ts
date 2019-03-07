import * as mysql from "mysql"
import * as util from "util";
import { UserInfo } from "../gameInterface";
import GameConfig from "../gameConfig";


export default class MysqlCenter {

    static connPool: mysql.Pool = null;
    static connectToCenter(host: string, port: number, db_name: string, uname: string, upwd: string) {
        MysqlCenter.connPool = mysql.createPool({
            host: host,
            port: port,
            database: db_name,
            user: uname,
            password: upwd,
        });
    }
    /**
     * 封装好的查询工具
     */
    static mysqlExec = function(sql: string) {
        return new Promise((resolve, reject) => {
           MysqlCenter.connPool.getConnection((err: mysql.MysqlError, conn: mysql.PoolConnection) => {
                if(err) {
                    reject(err);
                }else {
                    conn.query(sql, (err, rows: Array<UserInfo>) => {
                        if(err) {
                            console.log("err");
                            reject(err);
                        }else {
                            resolve(rows);
                        }

                        conn.release();
                    });
                }
           });
        });
    }

    /**
     * 获取玩家所有信息
     * @param openId 
     */
    static async getUserAllInfoByOpenId(openId: string) {
        let sql = "select openId, nickName, avatarUrl, gender, chip, exp, city, country, province, can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        console.log(sqlCmd);

        return await MysqlCenter.mysqlExec(sqlCmd)
    }
    /**
     * 通过openId 获取玩家信息
     * @param openId 
     */
    static async getUserInfoByopenId(openId: string) {
        let sql = "select chip, exp, can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);
        console.log(sqlCmd);

        return await MysqlCenter.mysqlExec(sqlCmd)
    }
    /**
     * 插入玩家信息
     * @param userInfo 
     */
    static async insertPlayerByopenId(userInfo: UserInfo) {
        let sql = "insert into user_info(`openId`, `nickName`, `avatarUrl`, `gender`, `city`, `country`, `province`, `can_login`)values(\"%s\", \"%s\", \"%s\", %d, \"%s\", \"%s\", \"%s\", 1)";
        let sqlCmd = util.format(sql, userInfo.openId, userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userInfo.city, userInfo.country, userInfo.province);
        console.log(sqlCmd);

        return await MysqlCenter.mysqlExec(sqlCmd);
    }
    /**
     * 更新玩家信息
     * @param userInfo 
     */
    static async updataUserInfoByOpenId(userInfo: UserInfo) {
        let sql = "update user_info set nickName = \"%s\", avatarUrl = \"%s\", gender = %d, city = \"%s\", country = \"%s\", province = \"%s\" where openId = \"%s\"";
        let sqlCmd = util.format(sql, userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userInfo.city, userInfo.country, userInfo.province, userInfo.openId);

        return await MysqlCenter.mysqlExec(sqlCmd);
    }

    static async isExistOpenid(openId: string) {
        let sql = "select can_login from user_info where openId = \"%s\" limit 1";
        let sqlCmd = util.format(sql, openId);

        return await MysqlCenter.mysqlExec(sqlCmd)
    }
}

MysqlCenter.connectToCenter(GameConfig.centerDatabase.host, GameConfig.centerDatabase.port, GameConfig.centerDatabase.db_name, GameConfig.centerDatabase.uname, GameConfig.centerDatabase.upwd);