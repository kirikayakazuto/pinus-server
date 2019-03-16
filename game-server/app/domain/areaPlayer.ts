import { UserInfo, Status } from "../gameInterface";
import { Session } from "pinus";
import {EventEmitter} from "events"

export default class AreaPlayer {
    openId = "";                    // openId, 玩家的唯一标识

    playerInfo: UserInfo = null;      // 玩家信息

    serverId = "";                  // 服务器id

    areaId = -1;                    // 区间号
    roomId: string = null;                    // 房间号
    seatId = -1;                    // 座位号
    state: number = Status.InView;   // 玩家状态

    eventEmitter: EventEmitter = new EventEmitter();    // 事件监听, 发送

    constructor(openId: string) {
        this.openId = openId;
    }

    initInfo(playerInfo: UserInfo) {
        this.playerInfo = playerInfo;
    }
    /**
     * 进入区间
     */
    enterArea(areaId: number, serverId: string) {
        this.areaId = areaId;
        this.serverId = serverId;
    }
    quitArea() {
        this.areaId = -1;
    }
    /**
     * 进入房间
     * @param roomId 
     */
    enterRoom(roomId: string) {
        this.roomId = roomId;
    }
    quitRoom() {
        this.roomId = null;
    }

    sitDown(seatId: number) {
        this.seatId = seatId;
    }

    standUp() {
        this.seatId = -1;
    }
}