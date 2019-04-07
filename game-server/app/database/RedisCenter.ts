import * as redis from "redis";
import RES from "../RES";
import { UserInfo } from "../gameInterface";
import DataBaseConfig from "./DateBaseConfig";
export default class RedisCenter {

    static centerRedis: redis.RedisClient = null;    

    static connectToCenter(host: string, port: number, dbIndex: number) {
        this.centerRedis = redis.createClient({
            host: host,
            port: port,
            db: dbIndex
        });
        console.log("connect to redis");

        this.centerRedis.on("error", (error) => {
            console.log("err");
        });
    }

    static setUserInfoInRedis = function(userInfo: UserInfo) {
        return new Promise((resolve, reject) => {
            let key = "redisCenterOpenId_" + userInfo.openId;
            RedisCenter.centerRedis.hmset(key, userInfo as any, (err) => {
                if(err) {
                    reject(err);
                }else {
                    resolve(RES.OK);
                }
            });
        });
    }

    static getUserInfoInRedis = function(openId: string) {
        return new Promise((resolve, reject) => {
            let key = "redisCenterOpenId_" + openId;
            RedisCenter.centerRedis.hgetall(key, (err, data) => {
                if(err) {
                    reject(err);
                }else {
                    let uinfo =RedisCenter._stringToNumber(data);
                    resolve(uinfo);
                }
            });
        });
    }

    static getWorldRankInfo = function(rankName: string, rankNum: number) {
        return new Promise((resolve, reject) => {
            RedisCenter.centerRedis.zrevrange(rankName, 0, rankNum, "withscores", (err, data) => {
                if(err) {
                    reject(err);
                }else {
                    resolve(data);
                }
            })
        });
    }
    /**
     * 等级榜
     * @param rankName 
     * @param openId 
     * @param exp 
     */
    static updateWorldRankInfo(rankName: string, openId: string, data: number) {
        RedisCenter.centerRedis.zadd(rankName, data, openId);
    }


    static _stringToNumber(data: any) {
        let uinfo: any = {};
        for(let key in data) {
            if( key == 'gender' ||
                key == 'chip'   ||
                key == 'exp'    ||
                key == 'can_login') {
                    uinfo[key] = parseInt(data[key]);
            }else {
                uinfo[key] = data[key];
            }
        }
        return uinfo;
    }
}

RedisCenter.connectToCenter(
    DataBaseConfig.redisConfig.host,
    DataBaseConfig.redisConfig.port,
    DataBaseConfig.redisConfig.db_index
);