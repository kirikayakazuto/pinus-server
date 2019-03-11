"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AreaService {
    constructor() {
        this.id = 0; // 服务号
        this.added = []; // 增加的实体
        this.reduced = []; //  减少的实体
        this.playerList = {}; // 玩家列表
        this.entities = {};
        this.channel = null;
        this.actionManagerService = null;
        this.consts = null;
    }
    /**
     * 初始化 服务参数
     * @param opts
     */
    init(opts) {
    }
    /**
     * 运行服务
     */
    run() {
        setInterval(this.tick.bind(this), 100);
    }
    /**
     * 钩子
     */
    tick() {
        // 开启动作管理系统
        // this.actionManagerService.update();
    }
    /**
     * 添加一个动作, 该动作会在下一次统一广播
     */
    addAction(action) {
    }
    /**
     *
     * @param type
     * @param id
     */
    abortAction(type, id) {
    }
    /**
     *
     * @param id
     */
    abortAllAction(id) {
    }
    /**
     * 获取通道
     */
    getChannel() {
    }
    /**
     * 给玩家 添加监听事件
     * @param player
     */
    addEvent(player) {
    }
    entityUpdate() {
    }
}
exports.default = AreaService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZS9hcmVhU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBO0lBQUE7UUFFSSxPQUFFLEdBQUcsQ0FBQyxDQUFDLENBQXFCLE1BQU07UUFFbEMsVUFBSyxHQUFVLEVBQUUsQ0FBQyxDQUFVLFFBQVE7UUFDcEMsWUFBTyxHQUFVLEVBQUUsQ0FBQyxDQUFRLFNBQVM7UUFDckMsZUFBVSxHQUFtQyxFQUFFLENBQUMsQ0FBSSxPQUFPO1FBQzNELGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxZQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLHlCQUFvQixHQUF5QixJQUFJLENBQUM7UUFDbEQsV0FBTSxHQUFXLElBQUksQ0FBQztJQThEMUIsQ0FBQztJQTVERzs7O09BR0c7SUFDSCxJQUFJLENBQUMsSUFBUztJQUVkLENBQUM7SUFFRDs7T0FFRztJQUNILEdBQUc7UUFDQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNEOztPQUVHO0lBQ0gsSUFBSTtRQUNBLFdBQVc7UUFDWCxzQ0FBc0M7SUFFMUMsQ0FBQztJQUNEOztPQUVHO0lBQ0gsU0FBUyxDQUFDLE1BQVc7SUFFckIsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsSUFBWSxFQUFFLEVBQVU7SUFFcEMsQ0FBQztJQUNEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxFQUFVO0lBRXpCLENBQUM7SUFDRDs7T0FFRztJQUNILFVBQVU7SUFFVixDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsUUFBUSxDQUFDLE1BQWtCO0lBRTNCLENBQUM7SUFFRCxZQUFZO0lBRVosQ0FBQztDQUNKO0FBeEVELDhCQXdFQyJ9