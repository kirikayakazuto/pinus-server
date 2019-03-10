export default class GameConfig {

    static appId = "wxa427e42117989ca3";
    static AppSecret = "f0a6bc02c71abc74a2393405ad7627b8";

    // static GATEWAY_CONNECT_IP = "106.13.53.55"
    static GATEWAY_CONNECT_IP = "127.0.0.1"

    static HOST_IP = "127.0.0.1";
    static MYSQL_PWD = "123";

    // 中心数据库 mysql配置
    static centerDatabase = {
        host : GameConfig.HOST_IP,
        port: 3306,
        db_name: "double_game_wx",

        uname : "root",
        upwd : GameConfig.MYSQL_PWD,

        defaultChip: 1000,
        defaultexp: 0,
    }
    /**
     * 房间参数配置
     */
    static roomConfig = {
        minChip: 100,
        betChip: 100,
        maxNum: 2,
    }

}