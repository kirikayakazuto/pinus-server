export default class GameServerConfig {
    
    static createUserconfig = {
        defaultUserExp      : 0,
        defaultUserChip     : 1000,
        defaultUserDiamonds : 0
    }

    static loginBonues = {
        clearLoginStraight  : false,
        bonues              : [100, 200, 300, 600, 1200]
    }

    static roomConfig = {
        minChip             : 100,
        betChip             : 100,
        betExp              : 100,          // 一局的基本经验值
        maxNum              : 2,
    }
}