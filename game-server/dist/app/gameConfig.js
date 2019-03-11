"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameConfig {
}
GameConfig.appId = "wxa427e42117989ca3";
GameConfig.AppSecret = "f0a6bc02c71abc74a2393405ad7627b8";
// static GATEWAY_CONNECT_IP = "106.13.53.55"
GameConfig.GATEWAY_CONNECT_IP = "127.0.0.1";
GameConfig.HOST_IP = "127.0.0.1";
GameConfig.MYSQL_PWD = "123";
// 中心数据库 mysql配置
GameConfig.centerDatabase = {
    host: GameConfig.HOST_IP,
    port: 3306,
    db_name: "double_game_wx",
    uname: "root",
    upwd: GameConfig.MYSQL_PWD,
    defaultChip: 1000,
    defaultexp: 0,
};
/**
 * 房间参数配置
 */
GameConfig.roomConfig = {
    minChip: 100,
    betChip: 100,
    maxNum: 2,
};
exports.default = GameConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9nYW1lQ29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBRVcsZ0JBQUssR0FBRyxvQkFBb0IsQ0FBQztBQUM3QixvQkFBUyxHQUFHLGtDQUFrQyxDQUFDO0FBRXRELDZDQUE2QztBQUN0Qyw2QkFBa0IsR0FBRyxXQUFXLENBQUE7QUFFaEMsa0JBQU8sR0FBRyxXQUFXLENBQUM7QUFDdEIsb0JBQVMsR0FBRyxLQUFLLENBQUM7QUFFekIsZ0JBQWdCO0FBQ1QseUJBQWMsR0FBRztJQUNwQixJQUFJLEVBQUcsVUFBVSxDQUFDLE9BQU87SUFDekIsSUFBSSxFQUFFLElBQUk7SUFDVixPQUFPLEVBQUUsZ0JBQWdCO0lBRXpCLEtBQUssRUFBRyxNQUFNO0lBQ2QsSUFBSSxFQUFHLFVBQVUsQ0FBQyxTQUFTO0lBRTNCLFdBQVcsRUFBRSxJQUFJO0lBQ2pCLFVBQVUsRUFBRSxDQUFDO0NBQ2hCLENBQUE7QUFDRDs7R0FFRztBQUNJLHFCQUFVLEdBQUc7SUFDaEIsT0FBTyxFQUFFLEdBQUc7SUFDWixPQUFPLEVBQUUsR0FBRztJQUNaLE1BQU0sRUFBRSxDQUFDO0NBQ1osQ0FBQTtBQTlCTCw2QkFnQ0MifQ==