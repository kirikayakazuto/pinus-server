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

export enum Status {
    NotEnoughPlayers = 1,   // 房间内玩家数目不够
    CanStartGame = 2,       // 人数已经够了, 可以开始游戏
    GameStarting = 3,       // 游戏进行中
    CheckOut = 4,           // 结算中
    Pausing = 5,            // 暂停中
}