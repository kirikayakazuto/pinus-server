import { dispatch } from '../../../util/dispatcher';
import { Application , BackendSession} from 'pinus';
import MysqlCenter from '../../../database/MysqlCenter';
import { UserInfo } from '../../../gameInterface';
import DataBaseConfig from '../../../database/DateBaseConfig';
import authWXServer from '../../../util/authWXServer';
import { any } from 'bluebird';
import RES from '../../../RES';

export default function (app: Application) {
    return new GateHandler(app);
}

export class GateHandler {
    constructor(private app: Application) {
    }

    async getWxOpenid(msg: {code: string, encryptedData: string, iv: string}, session: BackendSession) {
        let data: {status?: boolean, data?: any} = await authWXServer.httpsGetWX(msg.code, msg.encryptedData, msg.iv);
        if(data.status == true) {   // 获得了该玩家的openid
            let userInfo = await this.loginByOpenid(data.data);
            if(!userInfo) {
                return  {code: 201, msg: null}
            }
            return  {code: RES.OK, msg: userInfo}
        }else {
            return  {code: 202, msg: null}
        }
    }

    /**
     * 登录
     * @param userInfo 
     */
    async loginByOpenid(userInfo: UserInfo) {
        let openId = userInfo.openId;
        let userArr: any = await MysqlCenter.getUserInfoByopenId(openId);


        if(userArr.length <= 0) {
            // 插入一个新玩家
            await MysqlCenter.insertPlayerByopenId(userInfo);

            userInfo.chip = DataBaseConfig.mysqlConfig.defaultChip;
            userInfo.exp = DataBaseConfig.mysqlConfig.defaultExp;

        }else { // 将玩家信息返回
            if(userArr[0].can_login != 1) {         // 玩家被封号
                console.log("player can not login");
                return ;
            }

            await MysqlCenter.updataUserInfoByOpenId(userInfo);
            userInfo.chip = userArr[0].chip;
            userInfo.exp = userArr[0].exp;
        }

        return userInfo;
    }

    /**
     * Gate handler that dispatch user to connectors.
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param {Function} next next stemp callback
     *
     */
    async queryEntry(msg: {code: string, encryptedData: string, iv: string}, session: BackendSession) {

        if(!msg.code || !msg.encryptedData || !msg.iv) {
            return {code: 301, msg: null};
        }

        let wxResult = await this.getWxOpenid(msg, session);
        if(!wxResult.code || wxResult.code != 200) {
            return {code: 203, msg: null};
        }

        // get all connectors
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            return {code: 401, msg: null};
        }
        // select connector
        let res = dispatch(wxResult.msg.openId, connectors);
        return {
            code: RES.OK,
            msg: {
                host: res.host,
                port: res.clientPort,
                userInfo: wxResult.msg
            }
        };
    }
}