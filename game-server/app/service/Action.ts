/**
 * 封装一个动作类, 包含了动作的基本属性
 */
export default class Action {

    constructor() {
    }

    seatId: number = 0;             // 谁的动作
    cmd = -1;                       // 动作的类型
    data: any = null;               // 动作的描述

    setSeatId(seatId: number) {
        this.seatId = seatId;
    }

    setCmdAndData(cmd: number, data: any) {
        this.cmd = cmd;
        this.data = data;
    }
}

export class ActionPool {
    private pool: Array<Action> = [];
    private len = 5;

    constructor(len: number) {
        this.len = len || this.len;
        for(let i=0; i<len; i++) {
            this.pool.push(new Action());
        }
    }
    /**
     * 创建一个对象
     */
    public create() {
        let action = this.pool.length > 0 ? this.pool.shift() : new Action();
        return action;
    }
    /**
     * 回收一个对象
     */
    public recover(action: Action) {
        if(this.pool.length < this.len) {
            this.pool.push(action);
            return ;
        }
        action = null;
    }


}