import MysqlCenter from "../database/MysqlCenter";
import AreaPlayer from "./areaPlayer";
import GameServerConfig from "../GameServerConfig"
import utils from "../util/utils";
import RES from "../RES";

/**
 * 每日登录奖励
 * 时间: 2019年4月6日19:16:47
 * 作者: 邓朗
 */
export default class loginBonues {

    /**
     * 检查玩家是否需不需要领取每日奖励
     * @param player 
     */
    public static async checkHasLoginBonues(player: AreaPlayer) {
        let arr: any = await MysqlCenter.getLoginBonuesInfo(player.openId);
        
        if(!arr || arr.length <= 0) {  // 数据库没有这个用户, 创建一个
            await MysqlCenter.insertUserLoginBonues(player.openId, GameServerConfig.loginBonues.bonues[0]);
            return {code: RES.OK, msg: null};
        }
        let loginBonuesInfo = arr[0];
        if(!loginBonuesInfo) return {code: RES.ERR_SYSTEM, msg: "don have loginUserInfo"};

        let hasBonues = loginBonuesInfo.bonues_time < utils.timestamp_today();
        if(!hasBonues) return {code: RES.OK, msg: "时间戳不对"};
        let days = 1;
        let isStraight = loginBonuesInfo.bonues_time >= utils.timestamp_yesterday();
        if(isStraight)  days = loginBonuesInfo.days + 1;
        let index = days - 1;                   // 奖励索引
        if(days > GameServerConfig.loginBonues.bonues.length) {
            if(GameServerConfig.loginBonues.clearLoginStraight) {
                days = 1;
                index = 0;
            }else {
                index = GameServerConfig.loginBonues.bonues.length-1;
            }
        }
        await MysqlCenter.updateUserLoginBonuesInfo(player.openId, GameServerConfig.loginBonues.bonues[index], days);

        return {code: RES.OK, msg: {}}
    }

    public static async getLoginBonuesInfo(player: AreaPlayer) {
        let arr: any = await MysqlCenter.getLoginBonuesInfo(player.openId);

        if(!arr || arr.length <= 0) return {code: RES.ERR_SYSTEM, msg: "没有获取到arr"};

        let bonuesInfo = arr[0];
        if(bonuesInfo.status != 0) return {code: RES.ERR_SYSTEM, msg: "已经领取过了"};

        return {code: RES.OK, msg: {
            bonues  : bonuesInfo.bonues,
            days    : bonuesInfo.days,
        }};
    }

    public static async getLoginBonuesResult(player: AreaPlayer) {
        let arr: any = await MysqlCenter.getLoginBonuesInfo(player.openId);
        if(!arr || arr.length <= 0)  return {code: RES.ERR_SYSTEM, msg: ""};

        let bonuesInfo = arr[0];
        if(bonuesInfo.status != 0) return  {code: RES.ERR_SYSTEM, msg: null};

        await MysqlCenter.updateUserLoginBonuesRecved(player.openId);

        // 更新玩家数据
        await MysqlCenter.updataUserChipByOpenId(player.openId, bonuesInfo.bonues);


        return {code: RES.OK, msg: {
            bonues: bonuesInfo.bonues,
        }};
    }
}