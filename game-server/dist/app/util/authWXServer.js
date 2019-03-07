"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iconv = require("iconv-lite");
const WXBizDataCrypt_1 = require("../3rd/WXBizDataCrypt");
const gameConfig_1 = require("../gameConfig");
const https = require("https");
class authWxServer {
}
authWxServer.httpsGetWX = function (code, encryptedData, iv) {
    return new Promise((resolve, reject) => {
        let url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + gameConfig_1.default.appId + "&secret=" + gameConfig_1.default.AppSecret + "&js_code=" + code + "&grant_type=authorization_code";
        let req = https.get(url, function (res) {
            let datas = [];
            let size = 0;
            res.on("data", (data) => {
                datas.push(data);
                size += data.length;
            });
            res.on("end", () => {
                let buff = Buffer.concat(datas, size);
                let result = iconv.decode(buff, "utf8");
                // console.log("====", result);
                try {
                    let d = JSON.parse(result);
                    if (d.session_key) {
                        try {
                            let wxCrypt = new WXBizDataCrypt_1.default(gameConfig_1.default.appId, d.session_key);
                            // encryptedData和iv都是客户端传递的数据
                            let res = wxCrypt.decryptData(encryptedData, iv);
                            // res中包含了openId、unionId、nickName、avatarUrl等等信息
                            // 注意，如果你的小游戏没有绑定微信公众号，这里可能也不会有unionId
                            // 微信登录完成，可以开始进入游戏了
                            resolve({ status: true, data: res });
                        }
                        catch (error) {
                            // 错误处理
                            resolve({ status: false, data: error });
                        }
                    }
                    resolve({ status: false, data: result });
                }
                catch (e) {
                }
            });
        });
        req.on("error", (err) => {
            resolve({ status: false, data: err });
        });
        // req.end();
    });
};
exports.default = authWxServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFdYU2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWwvYXV0aFdYU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0NBQW1DO0FBQ25DLDBEQUFrRDtBQUNsRCw4Q0FBdUM7QUFDdkMsK0JBQThCO0FBRzlCOztBQUVXLHVCQUFVLEdBQUcsVUFBUyxJQUFZLEVBQUUsYUFBcUIsRUFBRSxFQUFVO0lBQ3hFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsSUFBSSxHQUFHLEdBQUcscURBQXFELEdBQUcsb0JBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLG9CQUFVLENBQUMsU0FBUyxHQUFHLFdBQVcsR0FBRyxJQUFJLEdBQUcsZ0NBQWdDLENBQUM7UUFFL0ssSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBUyxHQUFHO1lBRWpDLElBQUksS0FBSyxHQUFVLEVBQUUsQ0FBQztZQUN0QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7WUFFYixHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNwQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQixJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztZQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDZixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLCtCQUErQjtnQkFDL0IsSUFBRztvQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMzQixJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7d0JBQ2YsSUFBSTs0QkFDQSxJQUFJLE9BQU8sR0FBRyxJQUFJLHdCQUFjLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUVsRSw2QkFBNkI7NEJBQzdCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUVqRCwrQ0FBK0M7NEJBQy9DLHNDQUFzQzs0QkFDdEMsbUJBQW1COzRCQUNuQixPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO3lCQUN0Qzt3QkFDRCxPQUFPLEtBQUssRUFBRTs0QkFDVixPQUFPOzRCQUNQLE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7eUJBQ3pDO3FCQUNKO29CQUNELE9BQU8sQ0FBQyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7aUJBQzFDO2dCQUFBLE9BQU0sQ0FBQyxFQUFFO2lCQUVUO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILGFBQWE7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUE7QUFwREwsK0JBcURDIn0=