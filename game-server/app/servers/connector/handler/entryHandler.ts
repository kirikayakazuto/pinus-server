import {Application, Session} from 'pinus';
import {FrontendSession} from 'pinus';
import MysqlCenter from '../../../database/MysqlCenter';
import RES from '../../../res';


/**
 * 负责承载连接, 并发请求转发到后端的服务器群
 * 
 * 邓朗 2019/03/01
 */
export default function (app: Application) {
    return new EntryHandler(app);
}

export class EntryHandler {
    constructor(private app: Application) {
    }

    onlinePlayerList: {[openId: string]: FrontendSession} = {};     // 在线玩家列表

    matchPlayerList: {[openId: string]: FrontendSession} = {};      // 开启匹配玩家列表


    /**
     * 玩家进入connector服务器
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next stemp callback
     * @return {Void}
     */
    async enter(msg: {openId: string}, session: FrontendSession) {
        if(!msg || !msg.openId) {
            return {code: RES.ERR_PARAM, msg: null};
        }

        let resMysql: any = await MysqlCenter.isExistOpenid(msg.openId);
        if(!resMysql || resMysql.length <= 0 || resMysql[0].can_login != 1) {
            return {code: RES.ERR_NOT_LOGIN, msg: null};
        }

        let sessionService = this.app.get('sessionService');
        if (!!sessionService.getByUid(msg.openId)) {
            return {code: RES.ERR_IS_LOGIN, msg: null};
        }

        await session.abind(msg.openId);
        
        this.onlinePlayerList[msg.openId] = session;    // 添加在线用户

        session.on('closed', this.onUserLeave.bind(this));

        return {
            code: RES.OK,
            msg: {}
        }
    }
    /**
     * 开始匹配玩家
     */
    addMatchOnlinePlayer(msg: {roomType: number}, session: FrontendSession) {
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

        this.matchPlayerList[openId] = session;
        
        return {code: RES.OK, msg: {MatchPlayer: true}}
    }
    /**
     * 删除正在匹配的玩家
     */
    removeMatchOnlinePlayer(msg: {roomType: number}, session: FrontendSession) {
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
     * 为匹配玩家分配房间
     * step1, 给玩家提供host port地址, 房间号
     */
    allocRoomToMatchPlayer() {
        for(let key in this.matchPlayerList) {
            // this.matchPlayerList[key]
        }
    }

    

    /**
     * User log out handler
     *
     * @param {Object} app current application
     * @param {Object} session current session object
     *
     */
    onUserLeave(session: FrontendSession) {
        if (!session || !session.uid) {
            return;
        }

        // 退出匹配列表
        if(this.matchPlayerList[session.uid]) {
            this.matchPlayerList[session.uid] = null;
            delete this.matchPlayerList[session.uid];    
        }

        this.onlinePlayerList[session.uid] = null;
        delete this.onlinePlayerList[session.uid];

        return {code: RES.OK, msg: {}};
        // this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get('serverId'), session.get('rid'));
    }
}