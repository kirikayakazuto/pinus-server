import { ChatRemote } from '../remote/chatRemote';
import {Application, BackendSession} from 'pinus';
import { FrontendSession } from 'pinus';
import MysqlCenter from '../../../database/MysqlCenter';
import RES from '../../../RES';
import AreaPlayer from '../areaPlayer';
import AreaRoom from '../areaRoom';
import GameConfig from '../../../gameConfig';

const roomConfig = GameConfig.roomConfig;

export default function(app: Application) {
    return new ChatHandler(app);
}

export class ChatHandler {
    constructor(private app: Application) {
    }

    /**
     * 玩家列表
     */
    playerList: {[openId: string]: AreaPlayer} = {};

    /**
     * 开启的房间列表
     */
    roomList: {[roomId: string]: AreaRoom} = {};

    /**
     * 分配房间
     */
    doAllocRoom(roomId: string, player: AreaPlayer) {
        let areaId = player.areaId;
        let room = new AreaRoom(areaId, roomId);    // 有可能报错, 无areaId 玩家强行登入
        room.initConfig(roomConfig.maxNum, roomConfig.minChip, roomConfig.betChip);               // 测试数据, 正式数据应当写在json文件中
        room.playerEnter(player);
    }

    /**
     * 分配一个玩家
     */
    async allocPlayer(openId: string) {
        let player = new AreaPlayer(openId);
        let playerInfo: any = await MysqlCenter.getUserAllInfoByOpenId(openId);
        if(playerInfo.length <= 0) { // 没有这个玩家
            return null;
        }
        player.initInfo(playerInfo[0]);
        
        return player;
    }
    /**
     * 进入房间
     * @param msg 
     */    
    async enterRoom(msg: {roomId: string, maxNum: number}, session: BackendSession) {
        let player = this.playerList[session.uid];
        if(!player) {
            return {code: RES.ERR_SYSTEM, msg: null}
        }

        player.roomId = msg.roomId;

        if(!this.roomList[msg.roomId]) {                // 没有这个房间, 创建一个
            this.doAllocRoom(msg.roomId, player);                         // 房主
        }else {                                         // 有这个房间, 让该玩家进入
            this.roomList[msg.roomId].playerEnter(player)
        }
        return {code: RES.OK, msg: {roomId: msg.roomId}}
    }
    /**
     * 进入游戏区间
     */
    async entryArea(msg: {areaId: number, roomId: ""}, session: BackendSession) {
        let player = await this.allocPlayer(session.uid);
        if(!player) {
            return {code: RES.ERR_NOT_OPENID, msg: null}
        }

        if(this.playerList[player.openId]) {        // 玩家已经在游戏服务器 内了
            return {code: RES.ERR_AREA_PLAYER_LIST, msg: null}
        }
    
        this.playerList[player.openId] = player;
        player.enterArea(msg.areaId, session.frontendId);

        return {code: RES.OK, msg: {}}
    }

    /**
     * Send messages to users
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param  {Function} next next stemp callback
     *
     */
    async send(msg: {content: string , target: string}, session: BackendSession) {
        /* let rid = session.get('rid');
        let username = session.uid.split('*')[0];
        let channelService = this.app.get('channelService');
        let param = {
            msg: msg.content,
            from: username,
            target: msg.target
        };
        let channel = channelService.getChannel(rid, false);

        // the target is all users
        if (msg.target === '*') {
            channel.pushMessage('onChat', param);
        }
        // the target is specific user
        else {
            let tuid = msg.target + '*' + rid;
            let tsid = channel.getMember(tuid)['sid'];
            channelService.pushMessageByUids('onChat', param, [{
                uid: tuid,
                sid: tsid
            }]);
        } */
    }
}