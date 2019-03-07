"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class WXBizDataCrypt {
    constructor(appId, sessionKey) {
        this.appId = "wxa427e42117989ca3";
        this.AppSecret = "f0a6bc02c71abc74a2393405ad7627b8";
        this.sessionKey = "";
        this.appId = appId;
        this.sessionKey = sessionKey;
    }
    decryptData(encryptedData, iv) {
        // base64 decode
        var sessionKey = Buffer.from(this.sessionKey, 'base64');
        encryptedData = Buffer.from(encryptedData, 'base64');
        iv = Buffer.from(iv, 'base64');
        try {
            // 解密
            var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
            // 设置自动 padding 为 true，删除填充补位
            decipher.setAutoPadding(true);
            var decoded = decipher.update(encryptedData, 'binary', 'utf8');
            decoded += decipher.final('utf8');
            decoded = JSON.parse(decoded);
        }
        catch (err) {
            throw new Error('Illegal Buffer');
        }
        if (decoded.watermark.appid !== this.appId) {
            throw new Error('Illegal Buffer');
        }
        return decoded;
    }
}
exports.default = WXBizDataCrypt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV1hCaXpEYXRhQ3J5cHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvM3JkL1dYQml6RGF0YUNyeXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdDO0FBRWhDO0lBS0UsWUFBWSxLQUFhLEVBQUUsVUFBa0I7UUFKN0MsVUFBSyxHQUFHLG9CQUFvQixDQUFDO1FBQzdCLGNBQVMsR0FBRyxrQ0FBa0MsQ0FBQztRQUMvQyxlQUFVLEdBQUcsRUFBRSxDQUFDO1FBR2QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7SUFDOUIsQ0FBQztJQUVELFdBQVcsQ0FBQyxhQUFrQixFQUFFLEVBQU87UUFDckMsZ0JBQWdCO1FBQ2hCLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN2RCxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDcEQsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBRTlCLElBQUk7WUFDRixLQUFLO1lBQ0wsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDckUsNkJBQTZCO1lBQzdCLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDN0IsSUFBSSxPQUFPLEdBQVEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQ25FLE9BQU8sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBRWpDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBRTlCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUE7U0FDbEM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1NBQ2xDO1FBRUQsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQztDQUVGO0FBckNELGlDQXFDQyJ9