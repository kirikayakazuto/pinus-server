"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class utils {
    static random_string(len) {
        let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let maxPos = $chars.length;
        let str = '';
        for (let i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }
    static SimpleDateFormat(pattern) {
        var fmt = new Object();
        fmt["pattern"] = pattern;
        fmt["parse"] = function (source) {
            try {
                return new Date(source);
            }
            catch (e) {
                console.log("字符串 " + source + " 转时间格式失败！");
                return null;
            }
        };
        fmt["format"] = function (date) {
            /* if(typeof(date) == "undefined" || date == null || date==""){
                return "";
            } */
            try {
                date = new Date();
            }
            catch (e) {
                console.log("时间 " + date + " 格式化失败！");
                return "";
            }
            var strTime = this.pattern; //时间表达式的正则
            var o = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "H+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds() //毫秒 
            };
            if (/(y+)/.test(strTime)) {
                strTime = strTime
                    .replace(RegExp.$1, (date.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(strTime)) {
                    strTime = strTime.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return strTime;
        };
        return fmt;
    }
}
exports.default = utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFXO1FBQzVCLElBQUksTUFBTSxHQUFXLGdFQUFnRSxDQUFDO1FBRXRGLElBQUksTUFBTSxHQUFXLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbkMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFZO1FBQ2hDLElBQUksR0FBRyxHQUFRLElBQUksTUFBTSxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUV6QixHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBUyxNQUFXO1lBQy9CLElBQUc7Z0JBQ0MsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMzQjtZQUFBLE9BQU0sQ0FBQyxFQUFDO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFDLE1BQU0sR0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkMsT0FBTyxJQUFJLENBQUM7YUFDZjtRQUNMLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFTLElBQVM7WUFDOUI7O2dCQUVJO1lBQ0osSUFBRztnQkFDQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzthQUNyQjtZQUFBLE9BQU0sQ0FBQyxFQUFDO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFDLElBQUksR0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxFQUFFLENBQUM7YUFDYjtZQUVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQSxVQUFVO1lBRXJDLElBQUksQ0FBQyxHQUFRO2dCQUNMLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztnQkFDekIsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0MsR0FBRyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLO2FBQ3BDLENBQUM7WUFFRixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUM7Z0JBQ3JCLE9BQU8sR0FBRyxPQUFPO3FCQUNaLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQztxQkFDNUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEM7WUFDRCxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztnQkFDWixJQUFJLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFDO29CQUN4QyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkg7YUFDSjtZQUVELE9BQU8sT0FBTyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBL0RELHdCQStEQyJ9