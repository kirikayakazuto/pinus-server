"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FrameData {
    constructor() {
        this.curFrame = 0; // 当前的帧数
        this.actionList = []; // 动作列表
    }
    setCurFrame(curFrame) {
        this.curFrame = curFrame;
    }
    addAction(action) {
        this.actionList.push(action);
    }
    clearActionList() {
        this.actionList = [];
    }
    /**
     * 是否是空帧
     */
    isEmpty() {
        return this.actionList == null || this.actionList.length == 0;
    }
}
exports.default = FrameData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhbWVEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2UvRnJhbWVEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7SUFFSTtRQUlBLGFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBYyxRQUFRO1FBS25DLGVBQVUsR0FBa0IsRUFBRSxDQUFDLENBQUssT0FBTztJQVAzQyxDQUFDO0lBR0QsV0FBVyxDQUFDLFFBQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFJRCxTQUFTLENBQUMsTUFBYztRQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsZUFBZTtRQUNYLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFDRDs7T0FFRztJQUNILE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0NBQ0o7QUExQkQsNEJBMEJDIn0=