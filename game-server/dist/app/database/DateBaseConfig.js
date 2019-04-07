"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataBaseConfig {
}
DataBaseConfig.HOST_IP = "127.0.0.1";
DataBaseConfig.MYSQL_PWD = "123";
DataBaseConfig.mysqlConfig = {
    host: DataBaseConfig.HOST_IP,
    port: 3306,
    db_name: "double_game_wx",
    uname: "root",
    upwd: DataBaseConfig.MYSQL_PWD,
    defaultChip: 100,
    defaultExp: 0,
};
DataBaseConfig.redisConfig = {
    host: DataBaseConfig.HOST_IP,
    port: 6379,
    db_index: 0,
};
exports.default = DataBaseConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZUJhc2VDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGF0YWJhc2UvRGF0ZUJhc2VDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFHVyxzQkFBTyxHQUFHLFdBQVcsQ0FBQztBQUN0Qix3QkFBUyxHQUFHLEtBQUssQ0FBQztBQUNsQiwwQkFBVyxHQUFHO0lBQ2pCLElBQUksRUFBVSxjQUFjLENBQUMsT0FBTztJQUNwQyxJQUFJLEVBQVUsSUFBSTtJQUNsQixPQUFPLEVBQU8sZ0JBQWdCO0lBQzlCLEtBQUssRUFBUyxNQUFNO0lBQ3BCLElBQUksRUFBVSxjQUFjLENBQUMsU0FBUztJQUN0QyxXQUFXLEVBQUcsR0FBRztJQUNqQixVQUFVLEVBQUksQ0FBQztDQUNsQixDQUFDO0FBR0ssMEJBQVcsR0FBRztJQUNqQixJQUFJLEVBQVUsY0FBYyxDQUFDLE9BQU87SUFDcEMsSUFBSSxFQUFVLElBQUk7SUFDbEIsUUFBUSxFQUFNLENBQUM7Q0FDbEIsQ0FBQTtBQXBCTCxpQ0FxQkMifQ==