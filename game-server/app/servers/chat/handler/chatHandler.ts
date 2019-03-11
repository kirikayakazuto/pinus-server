
import {Application, BackendSession} from 'pinus';
import MysqlCenter from '../../../database/MysqlCenter';
import RES from '../../../RES';
import AreaPlayer from '../../../domain/areaPlayer';
import AreaRoom from '../../../domain/areaRoom';
import GameConfig from '../../../gameConfig';
import utils from '../../../util/utils';

const roomConfig = GameConfig.roomConfig;

export default function(app: Application) {
    return new ChatHandler(app);
}

export class ChatHandler {
    constructor(private app: Application) {
    }

    /**
     * 在线玩家列表
     */
    onlinePlayerList: {[openId: string]: AreaPlayer} = {};
    /**
     * 匹配玩家列表
     */
    matchPlayerList: {[openId: string]: AreaPlayer} = {};

    /**
     * 开启的房间列表
     */
    roomList: {[roomId: string]: AreaRoom} = {};

    /**
     * 开始匹配玩家
     */
    async addMatchOnlinePlayer(msg: {roomType: number}, session: BackendSession) {
        console.log("=========in");
        if(!msg || !msg.roomType) {
            return {code: RES.ERR_PARAM, msg: null};
        }

        let openId = session.uid;
        if(!openId) {
            return {code: RES.ERR_NOT_LOGIN, msg: null};
        }

        if(this.matchPlayerList[openId]) {
            return {code: RES.ERR_IS_IN_MASTH_LIST, msg: null}
        }

        this.matchPlayerList[openId] = this.onlinePlayerList[openId];
        
        return {code: RES.OK, msg: {MatchPlayer: true}}
    }
    /**
     * 删除正在匹配的玩家
     */
    async removeMatchOnlinePlayer(msg: {roomType: number}, session: BackendSession) {
        if(!msg || !msg.roomType) {
            return {code: RES.ERR_PARAM, msg: null};
        }
        let openId = session.uid;
        if(!openId) {
            return {code: RES.ERR_NOT_LOGIN, msg: null};
        }

        if(!this.matchPlayerList[openId]) {
            return {code: RES.ERR_NOT_IN_MASTH_LIST, msg: null}
        }

        this.matchPlayerList[openId] = null;
        delete this.matchPlayerList[openId]

        return {code: RES.OK, msg: {MatchPlayer: false}}
    }

    /**
     * 显示匹配到的玩家信息
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer(areaId: number) {
        for(let key in this.matchPlayerList) {
            let player = this.matchPlayerList[key];
            let room = this.doSearchRoom(areaId);
            if(player && room) {
                room.playerEnter(player);
            }
        }
    }
    /**
     * 获取一个随机字符串作为房间ID
     */
    getRandomRoomId() {
        return utils.random_string(16);
    }
    /**
     * 寻找一个房间
     */
    doSearchRoom(areaId: number) {
        for(let key in this.roomList) {
            let room = this.roomList[key];
            if(room.currentPlayerNum < room.maxNum) {
                return room;                            // 这个房间是合适的房间
            }
        }

        // 没有合适的房间
        let roomId = this.getRandomRoomId();
        return this.doAllocRoom(roomId, areaId);
    }

    /**
     * 分配房间
     */
    doAllocRoom(roomId: string, areaId: number) {
        let room = new AreaRoom(areaId, roomId);    // 有可能报错, 无areaId 玩家强行登入
        room.initConfig(roomConfig.maxNum, roomConfig.minChip, roomConfig.betChip);               // 测试数据, 正式数据应当写在json文件中
        return room;
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
     * 进入游戏区间
     */
    async entryArea(msg: {areaId: number}, session: BackendSession) {
        let player = await this.allocPlayer(session.uid);
        if(!player) {
            return {code: RES.ERR_NOT_OPENID, msg: null}
        }

        if(this.onlinePlayerList[player.openId]) {        // 玩家已经在游戏服务器 内了
            return {code: RES.ERR_AREA_PLAYER_LIST, msg: null}
        }
    
        this.onlinePlayerList[player.openId] = player;
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

