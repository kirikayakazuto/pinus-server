
import {Application, BackendSession} from 'pinus';
import MysqlCenter from '../../../database/MysqlCenter';
import RES from '../../../RES';
import AreaPlayer from '../../../domain/areaPlayer';
import AreaRoom from '../../../domain/areaRoom';
import GameServerConfig from "../../../GameServerConfig"
import utils from '../../../util/utils';
import { isDate } from 'util';
import Action from '../../../service/Action';
import { Status } from '../../../gameInterface';
import loginBonues from '../../../domain/loginBonues';
import RedisCenter from '../../../database/RedisCenter';

const roomConfig = GameServerConfig.roomConfig;

export default function(app: Application) {
    let chat = new ChatHandler(app);
    setInterval(chat.allocRoomToMatchPlayer.bind(chat), 500, 1);
    return chat;
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
        if(!msg || !msg.roomType) {
            return {code: RES.ERR_PARAM, msg: null};
        }

        let openId = session.uid;
        if(!openId) {
            return {code: RES.ERR_NOT_LOGIN, msg: null};
        }
        // 判断用户是否在服务器中
        if(!this.onlinePlayerList[openId]) {
            return {code: RES.ERR_PARAM, msg: null}
        }

        if(this.matchPlayerList[openId]) {      //玩家已经在匹配列表
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
        
        let player = this.onlinePlayerList[openId];
        if(!player) {
            return {code: RES.ERR_NOT_IN_MASTH_LIST, msg: null}
        }
        
        if(player.roomId) {  // 判断这个玩家是否已经进入了房间
            this.playerQuitRoom(player);
        }else {
            this.removePlayerFromMatchList(player);
        }
        return {code: RES.OK, msg: {MatchPlayer: false}}
    }

    /**
     * 玩家进入游戏场景
     * @param msg 
     * @param session 
     */
    async enterGameScene(msg: {press: number}, session: BackendSession) {
        let result = this.authPlayerIsInRoom(session.uid);
        if(result.code != RES.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;

        room.enterGameScene(player);

        return {code: RES.OK, msg: {}};
    }
    /**
     * 在帧同步期间收到
     * @param msg 
     * @param session 
     */
    async ReceivedPlayerCommand(msg: Action, session: BackendSession) {
        let result = this.authPlayerIsInRoom(session.uid);
        if(result.code != RES.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;

        if(room.status == Status.Playing) {
            room.addAction(msg, player.seatId);
            return {code: RES.OK, msg: {}}
        }
        return {code: RES.ERR_SYSTEM, msg: {}}
    }

    async gameOver(msg: any, session: BackendSession) {
        let result = this.authPlayerIsInRoom(session.uid);
        if(result.code != RES.OK) {
            return result;
        }
        let player = result.msg.player;
        let room = result.msg.room;

        await room.gameOver(msg, player.seatId);
        
        return {code: RES.OK, msg: {playerSeatId: player.seatId, msg: msg}}
    }
    /**
     * 验证玩家是否在房间
     */
    authPlayerIsInRoom(openId: string) {
        if(!openId) {
            return {code: RES.ERR_SYSTEM, msg: null}
        }

        let player = this.onlinePlayerList[openId];
        if(!player) {
            return {code: RES.ERR_SYSTEM, msg: null}
        }

        if(player.roomId == "" || player.seatId == -1) {
            return {code: RES.ERR_SYSTEM, msg: null}
        }

        let room = this.roomList[player.roomId];
        if(!room) {
            return {code: RES.ERR_SYSTEM, msg: null}
        }

        return {code: RES.OK, msg: {player: player, room: room}};
    }
    /**
     * 玩家退出房间
     * @param player 
     */
    playerQuitRoom(player: AreaPlayer) {
        let room = this.roomList[player.roomId];
        if(!room) {
            return ;
        }
        room.playerQuit(player);
    }

    /**
     * 显示匹配到的玩家信息
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer(areaId: number) {
        for(let key in this.matchPlayerList) {
            let player = this.matchPlayerList[key];
            if(player.roomId) {
                continue;
            }
            let room = this.doSearchRoom(areaId);
            if(player && room) {
                room.playerEnter(player);
                this.removePlayerFromMatchList(player);
            }
        }
    }
    /**
     * 从匹配列表删除玩家
     */
    removePlayerFromMatchList(player: AreaPlayer) {
        if(!this.matchPlayerList[player.openId]) {
            return ;
        }
        this.matchPlayerList[player.openId] = null;
        delete this.matchPlayerList[player.openId];
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
        room.initConfig(roomConfig.maxNum, roomConfig.minChip, roomConfig.betChip, roomConfig.betExp);
        this.roomList[roomId] = room;
        return room;
    }
    /**
     * 删除一个房间
     */
    doDeleteRoom(roomId: string, areaId: number) {
        let room = this.roomList[roomId];
        if(!room) {    // 没有这个房间
            return false;
        }
        if(!room.clearRoom()) {
            return false;
        }
        return true;
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
        let openId = session.uid;
        if(!openId) {
            return {code: RES.ERR_NOT_LOGIN, msg: null};
        }
        let player = await this.allocPlayer(openId);
        if(!player) {
            return {code: RES.ERR_NOT_OPENID, msg: null}
        }

        if(this.onlinePlayerList[player.openId]) {        // 玩家已经在游戏服务器 内了
            return {code: RES.ERR_AREA_PLAYER_LIST, msg: null}
        }
    
        this.onlinePlayerList[player.openId] = player;
        player.enterArea(msg.areaId, session.frontendId);

        // 添加到redis中
        RedisCenter.setUserInfoInRedis(player.playerInfo);
        RedisCenter.updateWorldRankInfo("WorldRankByChip", player.openId, player.playerInfo.chip);
        RedisCenter.updateWorldRankInfo("WorldRankByExp", player.openId, player.playerInfo.exp);
        RedisCenter.updateWorldRankInfo("WorldRankByCheckPoint", player.openId, 0);

        // 检查这个玩家是否已经领取了登录奖励
        let result = await loginBonues.checkHasLoginBonues(player);
        if(result.code != RES.OK) {
            return result;
        }
        return {code: RES.OK, msg: "玩家进入游戏区间"}
    }

    /**
     * 获取签到信息, 在前端展示
     * @param player 
     */
    async getLoginBonuesInfo(msg: {}, session: BackendSession) {
        let openId = session.uid;
        let player = this._checkPlayerInArea(openId);
        if(!player) return {code: RES.ERR_SYSTEM, msg: {}};

        let data = await loginBonues.getLoginBonuesInfo(player);
        return data;
    }

    async getLoginBonuesResult(msg: {}, session: BackendSession) {
        let openId = session.uid;
        let player = this._checkPlayerInArea(openId);
        if(!player) return {code: RES.ERR_SYSTEM, msg: {}};

        let resule = await loginBonues.getLoginBonuesResult(player);
        return resule;
    }

    /**
     * 检查玩家是否在服务器
     */
    _checkPlayerInArea(openId: string) {
        if(!openId) {
            return null;
        }
        let player = this.onlinePlayerList[openId];
        return player;
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
        
    }
}

