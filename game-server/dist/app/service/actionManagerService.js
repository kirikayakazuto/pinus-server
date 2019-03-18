"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = require("../util/Queue");
/**
 * 动作管理,  帧同步
 * 实现思路 服务器实时的接收来自客户端的指令请求(移动指令, 碰撞指令...), 但是会统一时间将这些请求广播
 * 也就是开一个定时器, 没隔一段时间将指令广播给客户端
 */
class ActionManagerService {
    constructor(areaId, roomId, channel) {
        this.areaId = -1; // 区间号
        this.roomId = ""; // 房间号
        this.channel = null;
        this.opts = {}; // 暂时不知道会传什么
        this.limit = 500; // 存储的动作命令最大数目
        this.actionList = new Array(2); // 命令
        this.actionQueue = new Queue_1.default(this.limit); // 动作指令队列, 先进先出
        this.areaId = areaId;
        this.roomId = roomId;
        this.channel = channel;
    }
    getChannel() {
        return this.channel;
    }
    /**
     * 添加一个动作
     * @param action
     */
    addAction(action) {
        this.actionList[action.seatId] = action;
        return this.actionQueue.push(action);
    }
    /**
     * 跑起来
     */
    update(curFrameCount) {
        /* let length = this.actionQueue.getSize();

        for(let i=0; i<length; i++) {
            let action = this.actionQueue.pop();

            if(action.aborted) {
                continue;
            }

            action.update();
            if(!action.finished) {
                this.actionQueue.push(action);
            }else {
                delete this.actionMap[action.type][action.id];
            }
        } */
    }
}
exports.default = ActionManagerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uTWFuYWdlclNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZS9hY3Rpb25NYW5hZ2VyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFpQztBQUdqQzs7OztHQUlHO0FBQ0g7SUFDSSxZQUFZLE1BQWMsRUFBRSxNQUFjLEVBQUUsT0FBZ0I7UUFLNUQsV0FBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQXdDLE1BQU07UUFDMUQsV0FBTSxHQUFHLEVBQUUsQ0FBQyxDQUF3QyxNQUFNO1FBRTFELFlBQU8sR0FBWSxJQUFJLENBQUM7UUFFeEIsU0FBSSxHQUF5QixFQUFFLENBQUMsQ0FBb0IsWUFBWTtRQUNoRSxVQUFLLEdBQUcsR0FBRyxDQUFDLENBQXdDLGNBQWM7UUFDbEUsZUFBVSxHQUFrQixJQUFJLEtBQUssQ0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFHLEtBQUs7UUFDekQsZ0JBQVcsR0FBRyxJQUFJLGVBQUssQ0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUSxlQUFlO1FBWi9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFXTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxTQUFTLENBQUMsTUFBYztRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDeEMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsYUFBcUI7UUFDL0I7Ozs7Ozs7Ozs7Ozs7OztZQWVJO0lBQ1IsQ0FBQztDQUNKO0FBbERELHVDQWtEQyJ9