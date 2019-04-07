export default class DataBaseConfig {


    static HOST_IP = "127.0.0.1";
    static MYSQL_PWD = "123";
    static mysqlConfig = {
        host        : DataBaseConfig.HOST_IP,
        port        : 3306,
        db_name     : "double_game_wx",
        uname       : "root",
        upwd        : DataBaseConfig.MYSQL_PWD,
        defaultChip : 100,
        defaultExp  : 0,
    };


    static redisConfig = {
        host        : DataBaseConfig.HOST_IP,
        port        : 6379,
        db_index    : 0,
    }
}