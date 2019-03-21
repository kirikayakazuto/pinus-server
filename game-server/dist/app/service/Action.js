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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2UvQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSDtJQUVJO1FBR0EsV0FBTSxHQUFXLENBQUMsQ0FBQyxDQUFhLE9BQU87UUFDdkMsUUFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQXVCLFFBQVE7UUFDeEMsU0FBSSxHQUFRLElBQUksQ0FBQyxDQUFlLFFBQVE7SUFKeEMsQ0FBQztJQU1ELFNBQVMsQ0FBQyxNQUFjO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxhQUFhLENBQUMsR0FBVyxFQUFFLElBQVM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFqQkQseUJBaUJDO0FBRUQ7SUFJSSxZQUFZLEdBQVc7UUFIZixTQUFJLEdBQWtCLEVBQUUsQ0FBQztRQUN6QixRQUFHLEdBQUcsQ0FBQyxDQUFDO1FBR1osSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMzQixLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFDRDs7T0FFRztJQUNJLE1BQU07UUFDVCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDckUsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNEOztPQUVHO0lBQ0ksT0FBTyxDQUFDLE1BQWM7UUFDekIsSUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZCLE9BQVE7U0FDWDtRQUNELE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUdKO0FBN0JELGdDQTZCQyJ9