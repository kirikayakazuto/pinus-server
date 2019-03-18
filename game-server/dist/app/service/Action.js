"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 封装一个动作类, 包含了动作的基本属性
 */
class Action {
    constructor() {
        this.seatId = 0; // 谁的动作
        this.cmd = -1; // 动作的类型
        this.data = null; // 动作的描述
    }
    setSeatId(seatId) {
        this.seatId = seatId;
    }
    setCmdAndData(cmd, data) {
        this.cmd = cmd;
        this.data = data;
    }
}
exports.default = Action;
class ActionPool {
    constructor(len) {
        this.pool = [];
        this.len = 5;
        this.len = len || this.len;
        for (let i = 0; i < len; i++) {
            this.pool.push(new Action());
        }
    }
    /**
     * 创建一个对象
     */
    create() {
        let action = this.pool.length > 0 ? this.pool.shift() : new Action();
        return action;
    }
    /**
     * 回收一个对象
     */
    recover(action) {
        if (this.pool.length < this.len) {
            this.pool.push(action);
            return;
        }
        action = null;
    }
}
exports.ActionPool = ActionPool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2UvQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSDtJQUVJO1FBR0EsV0FBTSxHQUFXLENBQUMsQ0FBQyxDQUFhLE9BQU87UUFDdkMsUUFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQXVCLFFBQVE7UUFDeEMsU0FBSSxHQUFrQyxJQUFJLENBQUMsQ0FBZSxRQUFRO0lBSmxFLENBQUM7SUFNRCxTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsYUFBYSxDQUFDLEdBQVcsRUFBRSxJQUFTO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBakJELHlCQWlCQztBQUVEO0lBSUksWUFBWSxHQUFXO1FBSGYsU0FBSSxHQUFrQixFQUFFLENBQUM7UUFDekIsUUFBRyxHQUFHLENBQUMsQ0FBQztRQUdaLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDM0IsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBQ0Q7O09BRUc7SUFDSSxNQUFNO1FBQ1QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3JFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDRDs7T0FFRztJQUNJLE9BQU8sQ0FBQyxNQUFjO1FBQ3pCLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QixPQUFRO1NBQ1g7UUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7Q0FHSjtBQTdCRCxnQ0E2QkMifQ==