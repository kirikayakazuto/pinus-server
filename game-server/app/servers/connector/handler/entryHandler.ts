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

        this.onlinePlayerList[session.uid] = null;
        delete this.onlinePlayerList[session.uid];

        return {code: RES.OK, msg: {}};
        // this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get('serverId'), session.get('rid'));
    }
}