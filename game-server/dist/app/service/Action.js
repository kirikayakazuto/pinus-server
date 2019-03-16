"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let id = 1;
/**
 * 封装一个动作类, 包含了动作的基本属性
 */
class Action {
    constructor(opts) {
        this.data = null;
        this.id = 0; // 当前动作的id
        this.type = ""; // 动作的类型
        this.singleton = false;
        this.aborted = false; // 是否可以执行, 被中止?
        this.finished = false; // 是否执行完毕
        this.data = opts.data;
        this.id = opts.id || id++;
        this.type = opts.type || "defaultAction";
        this.singleton = false || opts.singleton;
    }
    update() {
    }
}
exports.default = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2UvQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ1g7O0dBRUc7QUFDSDtJQUVJLFlBQVksSUFBUztRQU9yQixTQUFJLEdBQVEsSUFBSSxDQUFDO1FBQ2pCLE9BQUUsR0FBVyxDQUFDLENBQUMsQ0FBYSxVQUFVO1FBQ3RDLFNBQUksR0FBVyxFQUFFLENBQUMsQ0FBVyxRQUFRO1FBR3JDLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsWUFBTyxHQUFZLEtBQUssQ0FBQyxDQUFJLGVBQWU7UUFFNUMsYUFBUSxHQUFZLEtBQUssQ0FBQyxDQUFHLFNBQVM7UUFkbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksZUFBZSxDQUFBO1FBQ3hDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDN0MsQ0FBQztJQVlNLE1BQU07SUFFYixDQUFDO0NBQ0o7QUF0QkQseUJBc0JDIn0=