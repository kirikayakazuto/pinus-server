"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MysqlCenter_1 = require("../../../database/MysqlCenter");
const RES_1 = require("../../../RES");
const areaPlayer_1 = require("../areaPlayer");
function default_1(app) {
    return new ChatHandler(app);
}
exports.default = default_1;
class ChatHandler {
    constructor(app) {
        this.app = app;
        /**
         * 开启的房间列表
         */
        this.roomList = {};
    }
    /**
     * 分配一个玩家
     */
    async allocPlayer(openId) {
        let player = new areaPlayer_1.default(openId);
        let playerInfo = await MysqlCenter_1.default.getUserAllInfoByOpenId(openId);
        if (playerInfo.length <= 0) { // 没有这个玩家
            return { code: RES_1.default.ERR_OPENID, msg: null };
        }
        player.initInfo(playerInfo[0]);
        return { code: RES_1.default.ERR_OPENID, msg: player };
    }
    /**
     * 进入房间
     * @param msg
     */
    enterRoom(msg) {
        if (!this.roomList[msg.roomId]) { // 没有这个房间, 创建一个
            this.doAllocRoom();
        }
        else { // 有这个房间, 让该玩家进入
        }
    }
    /**
     * 分配房间
     */
    doAllocRoom() {
    }
    /**
     * 进入游戏区间
     */
    async entryArea(msg, session) {
        let player = this.allocPlayer(session.uid);
        player.then((data) => {
            if (data.code == RES_1.default.OK) {
            }
        });
        // player.enterArea(msg.areaId, session.frontendId);
        // session.frontendId;
        /* let openId = session.uid;
        if(!openId) {
            return {code: RES.ERR_PARAM, msg: null};
        }

        if(!!this.onlinePlayerList[openId]) {
            return {code: RES.ERR_IS_IN_GAME_SERVER, msg: null};
        }

        let player = await this.allocPlayer(openId, session);
        this.onlinePlayerList[player.openId] = player; */
        return { code: RES_1.default.OK, msg: {} };
    }
    /**
     * Send messages to users
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param  {Function} next next stemp callback
     *
     */
    async send(msg, session) {
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
exports.ChatHandler = ChatHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwrREFBd0Q7QUFDeEQsc0NBQStCO0FBRS9CLDhDQUF1QztBQUV2QyxtQkFBd0IsR0FBZ0I7SUFDcEMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRDtJQUNJLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFHcEM7O1dBRUc7UUFDSCxhQUFRLEdBQW9DLEVBQUUsQ0FBQztJQUwvQyxDQUFDO0lBT0Q7O09BRUc7SUFDSCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQWM7UUFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLElBQUksVUFBVSxHQUFRLE1BQU0scUJBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RSxJQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLEVBQUUsU0FBUztZQUNsQyxPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFBO1NBQzNDO1FBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixPQUFPLEVBQUMsSUFBSSxFQUFFLGFBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxDQUFBO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLENBQUMsR0FBcUM7UUFDM0MsSUFBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQWlCLGVBQWU7WUFDM0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3RCO2FBQUssRUFBMEMsZ0JBQWdCO1NBRS9EO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVztJQUVYLENBQUM7SUFDRDs7T0FFRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBcUIsRUFBRSxPQUF1QjtRQUUxRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDakIsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLGFBQUcsQ0FBQyxFQUFFLEVBQUc7YUFFeEI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILG9EQUFvRDtRQUNwRCxzQkFBc0I7UUFDdEI7Ozs7Ozs7Ozs7eURBVWlEO1FBRWpELE9BQU8sRUFBQyxJQUFJLEVBQUUsYUFBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQXVDLEVBQUUsT0FBdUI7UUFDdkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFzQkk7SUFDUixDQUFDO0NBQ0o7QUF0R0Qsa0NBc0dDIn0=