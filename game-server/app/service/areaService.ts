import { Channel } from "pinus";
import Consts from "../consts/consts";
import AreaPlayer from "../domain/areaPlayer";

export default class AreaService {

    id = 0;                     // 服务号

    added: any[] = [];          // 增加的实体
    reduced: any[] = [];        //  减少的实体
    playerList: {[openId: string]: AreaPlayer} = {};    // 玩家列表
    entities = {};
    channel: Channel = null;

    consts: Consts = null;

    /**
     * 初始化 服务参数
     * @param opts 
     */
    init(opts: any) {

    }
    
    /**
     * 运行服务
     */
    run() {
        setInterval(this.tick.bind(this), 100);
    }
    /**
     * 钩子
     */
    tick() {
        // 开启动作管理系统
        // this.actionManagerService.update();

    }
    /**
     * 添加一个动作, 该动作会在下一次统一广播
     */
    addAction(action: any) {

    }
    /**
     * 
     * @param type 
     * @param id 
     */
    abortAction(type: string, id: number) {

    }
    /**
     * 
     * @param id 
     */
    abortAllAction(id: number) {

    }
    /**
     * 获取通道
     */
    getChannel() {

    }
    /**
     * 给玩家 添加监听事件
     * @param player 
     */
    addEvent(player: AreaPlayer) {
        
    }

    entityUpdate() {
        
    }
}