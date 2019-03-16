let id = 1;
/**
 * 封装一个动作类, 包含了动作的基本属性
 */
export default class Action {

    constructor(opts: any) {
        this.data = opts.data;
        this.id = opts.id || id++;
        this.type = opts.type || "defaultAction"
        this.singleton = false || opts.singleton;
    }

    data: any = null;
    id: number = 0;             // 当前动作的id
    type: string = "";           // 动作的类型
    

    singleton: boolean = false;
    aborted: boolean = false;    // 是否可以执行, 被中止?

    finished: boolean = false;   // 是否执行完毕

    public update() {           

    }
}