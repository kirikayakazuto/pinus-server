import Queue from "../util/Queue"
import Action from "./Action";
/**
 * 动作管理,  帧同步
 * 实现思路 服务器实时的接收来自客户端的指令请求(移动指令, 碰撞指令...), 但是会统一时间将这些请求广播
 * 也就是开一个定时器, 没隔一段时间将指令广播给客户端
 */
export default class ActionManagerService {
    constructor(areaId: number, roomId: string) {
        this.areaId = areaId;
        this.roomId = roomId;
    }
    areaId = -1;                                        // 区间号
    roomId = "";                                        // 房间号

    opts: {[key: number]: any} = {};                    // 暂时不知道会传什么
    limit = 500;                                        // 存储的动作命令最大数目
    actionMap: {[key: string]: any} = {};               // 动作指令集合
    actionQueue = new Queue<Action>(this.limit);        // 动作指令队列, 先进先出

    /**
     * 添加一个动作
     * @param action 
     */
    public addAction(action: Action) {
        if(action.singleton) {
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
    public abortAction(type: string, id: number) {
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
    public abortAllAction(id: number) {
        for (var type in this.actionMap) {
            if (!!this.actionMap[type][id])
                this.actionMap[type][id].aborted = true;
        }
    }
    /**
     * 跑起来
     */
    public update() {
        let length = this.actionQueue.getSize();

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
        }
    }
}