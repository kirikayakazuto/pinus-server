"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("../util/Queue");
/**
 * 动作管理,  帧同步
 * 实现思路 服务器实时的接收来自客户端的指令请求(移动指令, 碰撞指令...), 但是会统一时间将这些请求广播
 * 也就是开一个定时器, 没隔一段时间将指令广播给客户端
 */
class ActionManagerService {
    constructor(areaId, roomId) {
        this.areaId = -1; // 区间号
        this.roomId = ""; // 房间号
        this.opts = {}; // 暂时不知道会传什么
        this.limit = 500; // 存储的动作命令最大数目
        this.actionMap = {}; // 动作指令集合
        this.actionQueue = new Queue_1.default(this.limit); // 动作指令队列, 先进先出
        this.areaId = areaId;
        this.roomId = roomId;
    }
    /**
     * 添加一个动作
     * @param action
     */
    addAction(action) {
        if (action.singleton) {
            this.abortAction(action.type, action.id);
        }
        this.actionMap[action.type] = this.actionMap[action.type] || {};
        this.actionMap[action.type][action.id] = action;
        return this.actionQueue.push(action);
    }
    /**
     * 中止一个动作
     * @param type
     * @param id
     */
    abortAction(type, id) {
        if (!this.actionMap[type] || !this.actionMap[type][id]) {
            return;
        }
        this.actionMap[type][id].aborted = true;
        delete this.actionMap[type][id];
    }
    /**
     * 中止所有的动作
     * @param id
     */
    abortAllAction(id) {
        for (var type in this.actionMap) {
            if (!!this.actionMap[type][id])
                this.actionMap[type][id].aborted = true;
        }
    }
    /**
     * 跑起来
     */
    update() {
        let length = this.actionQueue.getSize();
        for (let i = 0; i < length; i++) {
            let action = this.actionQueue.pop();
            if (action.aborted) {
                continue;
            }
            action.update();
            if (!action.finished) {
                this.actionQueue.push(action);
            }
            else {
                delete this.actionMap[action.type][action.id];
            }
        }
    }
}
exports.default = ActionManagerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uTWFuYWdlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZS9hY3Rpb25NYW5hZ2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFpQztBQUVqQzs7OztHQUlHO0FBQ0g7SUFDSSxZQUFZLE1BQWMsRUFBRSxNQUFjO1FBSTFDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUF3QyxNQUFNO1FBQzFELFdBQU0sR0FBRyxFQUFFLENBQUMsQ0FBd0MsTUFBTTtRQUUxRCxTQUFJLEdBQXlCLEVBQUUsQ0FBQyxDQUFvQixZQUFZO1FBQ2hFLFVBQUssR0FBRyxHQUFHLENBQUMsQ0FBd0MsY0FBYztRQUNsRSxjQUFTLEdBQXlCLEVBQUUsQ0FBQyxDQUFlLFNBQVM7UUFDN0QsZ0JBQVcsR0FBRyxJQUFJLGVBQUssQ0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUSxlQUFlO1FBVC9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFTRDs7O09BR0c7SUFDSSxTQUFTLENBQUMsTUFBYztRQUMzQixJQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM1QztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2hELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSxXQUFXLENBQUMsSUFBWSxFQUFFLEVBQVU7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3BELE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUNEOzs7T0FHRztJQUNJLGNBQWMsQ0FBQyxFQUFVO1FBQzVCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUM3QixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQy9DO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0ksTUFBTTtRQUNULElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFeEMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBRXBDLElBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDZixTQUFTO2FBQ1o7WUFFRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2pDO2lCQUFLO2dCQUNGLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0o7SUFDTCxDQUFDO0NBQ0o7QUFyRUQsdUNBcUVDIn0=