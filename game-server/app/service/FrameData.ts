import Action from "./Action";

export default class FrameData {

    constructor() {

    }

    curFrame = 0;              // 当前的帧数
    setCurFrame(curFrame: number) {
        this.curFrame = curFrame;
    }

    actionList: Array<Action> = [];     // 动作列表

    addAction(action: Action) {
        this.actionList.push(action);
    }

    clearActionList() {
        this.actionList = [];
    }
    /**
     * 是否是空帧
     */
    isEmpty() {
        return this.actionList == null || this.actionList.length == 0
    }
}