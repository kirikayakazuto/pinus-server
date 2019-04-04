import { UserInfo, Status } from "../gameInterface";
import {EventEmitter} from "events"
import AreaRoom from "./areaRoom";
import MysqlCenter from "../database/MysqlCenter";

export default class AreaPlayer {
    openId = "";                    // openId, 玩家的唯一标识

    playerInfo: UserInfo = null;      // 玩家信息

    serverId = "";                  // 服务器id

    areaId = -1;                    // 区间号
    roomId: string = null;                    // 房间号
    seatId = -1;                        // 座位号
    state: number = Status.NotInRoom;   // 玩家状态

    isWin = 0;                  // 0表示未知, -1表示输了, 1表示赢了

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
        this.state = Status.InView;
        this.roomId = roomId;
    }
    quitRoom() {
        this.state = Status.NotInRoom;
        this.roomId = null;
    }
    sitDown(seatId: number) {
        this.state = Status.OnTheSeat;
        this.seatId = seatId;
    }
    standUp() {
        this.state = Status.InView;
        this.seatId = -1;
    }
    ready() {
        this.state = Status.Ready;
    }
    NoReady() {
        this.state = Status.OnTheSeat;
    }

    playing() {
        this.state = Status.Playing;
    }

    /**
     * 结算游戏
     * 更新玩家的金币数目
     * 增加经验值
     */
    async checkOutGame(betChip: number, expAddNum: number) {
        this.state = Status.CheckOut;
        await MysqlCenter.updataUserChipByOpenId(this.openId, betChip);
        await MysqlCenter.updateUserExpByOpenId(this.openId, expAddNum);
    }

    /**
     * 游戏结束了, 清除过时数据
     */
    checkOutOver() {
        this.roomId = null;
        this.seatId = -1;
        this.state = Status.NotInRoom
        this.isWin = 0;
    }
}