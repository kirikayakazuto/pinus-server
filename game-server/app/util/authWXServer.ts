import * as iconv from "iconv-lite"
import WXBizDataCrypt from "../3rd/WXBizDataCrypt"
import gameConfig from "../gameConfig";
import * as https from "https"


export default class authWxServer {

    static httpsGetWX = function(code: string, encryptedData: string, iv: string) {
        return new Promise((resolve, reject) => {
            let url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + gameConfig.appId + "&secret=" + gameConfig.AppSecret + "&js_code=" + code + "&grant_type=authorization_code";

            let req = https.get(url, function(res) {

                let datas: any[] = [];
                let size = 0;

                res.on("data", (data) => {
                    datas.push(data);
                    size += data.length;
                });

                res.on("end", () => {
                    let buff = Buffer.concat(datas, size);
                    let result = iconv.decode(buff, "utf8");
                    // console.log("====", result);
                    try{
                        let d = JSON.parse(result);
                        if (d.session_key) {
                            try {
                                let wxCrypt = new WXBizDataCrypt(gameConfig.appId, d.session_key);
            
                                // encryptedData和iv都是客户端传递的数据
                                let res = wxCrypt.decryptData(encryptedData, iv);
            
                                // res中包含了openId、unionId、nickName、avatarUrl等等信息
                                // 注意，如果你的小游戏没有绑定微信公众号，这里可能也不会有unionId
                                // 微信登录完成，可以开始进入游戏了
                                resolve({status: true, data: res});
                            }
                            catch (error) {
                                // 错误处理
                                resolve({status: false, data: error});
                            }
                        }
                        resolve({status: false, data: result});
                    }catch(e) {

                    }
                });
            });

            req.on("error", (err) => {
                resolve({status: false, data: err});
            });

            // req.end();
        });
    }
}

