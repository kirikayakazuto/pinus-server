"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const RES_1 = require("../RES");
const DateBaseConfig_1 = require("./DateBaseConfig");
class RedisCenter {
    static connectToCenter(host, port, dbIndex) {
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
    /**
     * 等级榜
     * @param rankName
     * @param openId
     * @param exp
     */
    static updateWorldRankInfo(rankName, openId, data) {
        RedisCenter.centerRedis.zadd(rankName, data, openId);
    }
    static _stringToNumber(data) {
        let uinfo = {};
        for (let key in data) {
            if (key == 'gender' ||
                key == 'chip' ||
                key == 'exp' ||
                key == 'can_login') {
                uinfo[key] = parseInt(data[key]);
            }
            else {
                uinfo[key] = data[key];
            }
        }
        return uinfo;
    }
}
RedisCenter.centerRedis = null;
RedisCenter.setUserInfoInRedis = function (userInfo) {
    return new Promise((resolve, reject) => {
        let key = "redisCenterOpenId_" + userInfo.openId;
        RedisCenter.centerRedis.hmset(key, userInfo, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(RES_1.default.OK);
            }
        });
    });
};
RedisCenter.getUserInfoInRedis = function (openId) {
    return new Promise((resolve, reject) => {
        let key = "redisCenterOpenId_" + openId;
        RedisCenter.centerRedis.hgetall(key, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                let uinfo = RedisCenter._stringToNumber(data);
                resolve(uinfo);
            }
        });
    });
};
RedisCenter.getWorldRankInfo = function (rankName, rankNum) {
    return new Promise((resolve, reject) => {
        RedisCenter.centerRedis.zrevrange(rankName, 0, rankNum, "withscores", (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.default = RedisCenter;
RedisCenter.connectToCenter(DateBaseConfig_1.default.redisConfig.host, DateBaseConfig_1.default.redisConfig.port, DateBaseConfig_1.default.redisConfig.db_index);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkaXNDZW50ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGF0YWJhc2UvUmVkaXNDZW50ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsZ0NBQXlCO0FBRXpCLHFEQUE4QztBQUM5QztJQUlJLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxPQUFlO1FBQzlELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUNsQyxJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJO1lBQ1YsRUFBRSxFQUFFLE9BQU87U0FDZCxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUF3Q0Q7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsSUFBWTtRQUNyRSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFHRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQVM7UUFDNUIsSUFBSSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ3BCLEtBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ2pCLElBQUksR0FBRyxJQUFJLFFBQVE7Z0JBQ2YsR0FBRyxJQUFJLE1BQU07Z0JBQ2IsR0FBRyxJQUFJLEtBQUs7Z0JBQ1osR0FBRyxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUN4QztpQkFBSztnQkFDRixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDOztBQTdFTSx1QkFBVyxHQUFzQixJQUFJLENBQUM7QUFldEMsOEJBQWtCLEdBQUcsVUFBUyxRQUFrQjtJQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLElBQUksR0FBRyxHQUFHLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDakQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFFBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3hELElBQUcsR0FBRyxFQUFFO2dCQUNKLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNmO2lCQUFLO2dCQUNGLE9BQU8sQ0FBQyxhQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBO0FBRU0sOEJBQWtCLEdBQUcsVUFBUyxNQUFjO0lBQy9DLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsSUFBSSxHQUFHLEdBQUcsb0JBQW9CLEdBQUcsTUFBTSxDQUFDO1FBQ3hDLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUMvQyxJQUFHLEdBQUcsRUFBRTtnQkFDSixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZjtpQkFBSztnQkFDRixJQUFJLEtBQUssR0FBRSxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBO0FBRU0sNEJBQWdCLEdBQUcsVUFBUyxRQUFnQixFQUFFLE9BQWU7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDaEYsSUFBRyxHQUFHLEVBQUU7Z0JBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2Y7aUJBQUs7Z0JBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pCO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQTtBQXRETCw4QkFnRkM7QUFFRCxXQUFXLENBQUMsZUFBZSxDQUN2Qix3QkFBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQy9CLHdCQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFDL0Isd0JBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUN0QyxDQUFDIn0=