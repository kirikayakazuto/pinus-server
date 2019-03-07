import { Channel, pinus } from "pinus";
import AreaPlayer from "./areaPlayer";
import RES from "../../RES";

/**
 * 游戏房间
 */
export default class AreaRoom {

    areaId = -1;                // 区间id
    roomId = "";                // 房间id 唯一标识      随机字符串, 让其他玩家无法进入
    minChip = 100;              // 最低进入金币
    betChip = 100;              // 没把所需的金币数目

    maxNum = 2;                 // 房间最大人数
    playerList: {[openId: string]: AreaPlayer} = {};
    actionManagerService: any = null;

    currentPlayerNum = 0;                 // 房间当前玩家数目

    channel: Channel = null;    // 通道, 用于接收, 发送信息

    /**
     * 初始化房间参数
     */
    constructor(areaId: number, roomId: string) {
        this.areaId = areaId;
        this.roomId = roomId;
    }
    /**
     * 初始化配置
     * @param maxNum 
     * @param minChip 
     * @param betChip 
     */
    initConfig(maxNum: number, minChip: number, betChip: number) {
        this.maxNum = maxNum;
        this.minChip = minChip;
        this.betChip = betChip;
    }
    
    /**
     * 开始执行游戏进程
     */
    run() {

    }
    /**
     * 获取通道
     * 有就返回, 没有就新建一个
     */
    getChannel() {
        if (this.channel) {
            return this.channel;
        }
        this.channel = pinus.app.get('channelService').getChannel('area_room_' + this.roomId, true);       // true表示没有就会新建
        return this.channel;
    }
    /**
     * 玩家进入
     * @param player 
     */
    playerEnter(player: AreaPlayer) {
        if(this.currentPlayerNum > this.maxNum) {
            return {code: RES.ERR_ROOM_FULL, msg: null};
        }
        if(this.playerList[player.openId]) {
            return {code: RES.ERR_PLAYER_IS_IN_ROOM, msg: null};
        }

        this.playerList[player.openId] = player;

        player.enterRoom(this.roomId);
        this.getChannel().add(player.openId, player.serverId)

        return {code: RES.OK, msg: {}}
    }

    playerQuit(player: AreaPlayer) {
        if(!this.playerList[player.openId]) {
            return {code: RES.ERR_PLAYER_IS_NOT_IN_ROOM, msg: null};
        }

        this.playerList[player.openId] = null;
        delete this.playerList[player.openId];

        player.quitRoom();

        return {code: RES.OK, msg: {}}
    }
    /**
     * 添加事件
     */
    addEvent(player: AreaPlayer) {
        let self = this;
        player.eventEmitter.on("good", () => {

        })
    }



}