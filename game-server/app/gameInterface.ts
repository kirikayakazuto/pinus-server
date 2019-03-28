export interface UserInfo {
    openId?: string,
    nickName?: string,
    avatarUrl?: string,
    gender?: number,
    chip?: number,
    exp?: number,
    city?: string,
    country?: string,
    province?: string,
    can_login?: number,
}

export interface HistoryInfo {
    selfOpenId?: string,
    selfNickName?: string,
    otherOpenId?: string,
    otherNickName?: string
    dist?: string,
    time?: string,
    chip?: number,
    isWin?: number,
    exp?: number,
}

export enum Status {
    /**
     * -----------------房间状态---------------
     */
    NotEnoughPlayers = 1,   // 房间内玩家数目不够
    CanStartGame = 2,       // 人数已经够了, 可以开始游戏
    GameStarting = 3,       // 游戏进行中
    CheckOut = 4,           // 结算中
    Pausing = 5,            // 暂停中
    /**
     * ----------------玩家的状态--------------
     */

    Ready = 6,          // 准备开始
    Playing = 7,        // 游戏进行中
    InView = 8,         // 还没准备好
    NotInRoom = 9,     // 没有在房间内
    OnTheSeat = 10,     // 在座位上
}