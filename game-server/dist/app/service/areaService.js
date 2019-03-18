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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZS9hcmVhU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBO0lBQUE7UUFFSSxPQUFFLEdBQUcsQ0FBQyxDQUFDLENBQXFCLE1BQU07UUFFbEMsVUFBSyxHQUFVLEVBQUUsQ0FBQyxDQUFVLFFBQVE7UUFDcEMsWUFBTyxHQUFVLEVBQUUsQ0FBQyxDQUFRLFNBQVM7UUFDckMsZUFBVSxHQUFtQyxFQUFFLENBQUMsQ0FBSSxPQUFPO1FBQzNELGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxZQUFPLEdBQVksSUFBSSxDQUFDO1FBRXhCLFdBQU0sR0FBVyxJQUFJLENBQUM7SUE4RDFCLENBQUM7SUE1REc7OztPQUdHO0lBQ0gsSUFBSSxDQUFDLElBQVM7SUFFZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxHQUFHO1FBQ0MsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFDRDs7T0FFRztJQUNILElBQUk7UUFDQSxXQUFXO1FBQ1gsc0NBQXNDO0lBRTFDLENBQUM7SUFDRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFXO0lBRXJCLENBQUM7SUFDRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLElBQVksRUFBRSxFQUFVO0lBRXBDLENBQUM7SUFDRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsRUFBVTtJQUV6QixDQUFDO0lBQ0Q7O09BRUc7SUFDSCxVQUFVO0lBRVYsQ0FBQztJQUNEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxNQUFrQjtJQUUzQixDQUFDO0lBRUQsWUFBWTtJQUVaLENBQUM7Q0FDSjtBQXhFRCw4QkF3RUMifQ==