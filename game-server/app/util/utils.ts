export default class utils {
    static random_string(len: number): string {
        let $chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 

        let maxPos: number = $chars.length;
        let str: string = '';
        for (let i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }

    static SimpleDateFormat(pattern: any){
        var fmt: any = new Object();
        fmt["pattern"] = pattern;
        
        fmt["parse"] = function(source: any){
            try{
                return new Date(source);
            }catch(e){
                console.log("字符串 "+source+" 转时间格式失败！");
                return null;
            }
        };
        
        fmt["format"] = function(date: any){
            /* if(typeof(date) == "undefined" || date == null || date==""){
                return "";
            } */
            try{
                date = new Date();
            }catch(e){
                console.log("时间 "+date+" 格式化失败！");
                return "";
            }
            
            var strTime = this.pattern;//时间表达式的正则
            
            var o: any = {
                    "M+": date.getMonth() + 1, //月份 
                    "d+": date.getDate(), //日 
                    "H+": date.getHours(), //小时 
                    "m+": date.getMinutes(), //分 
                    "s+": date.getSeconds(), //秒 
                    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
                    "S": date.getMilliseconds() //毫秒 
                };
            
                if (/(y+)/.test(strTime)){
                    strTime = strTime
                        .replace(RegExp.$1, (date.getFullYear() + "")
                        .substr(4 - RegExp.$1.length));
                } 
                
                for (var k in o){
                    if (new RegExp("(" + k + ")").test(strTime)){
                        strTime = strTime.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));	
                    }
                }
                
                return strTime;
        };
        return fmt;
    }

    /**
     * --------------------------------- 时间戳 ----------------------------
     */
    // 返回当前的时间戳
    static timestamp(): number {
        let date = new Date();
        let time = Date.parse(date.toString());

        time /= 1000;
        return time;
    }
    // 
    static timestamp2date(time: number): Array<any> {
        let date = new Date();
        date.setTime(time * 1000);
        return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    }
    // 
    static date2timestamp(strtime: string): number {
        let date = new Date(strtime.replace(/-/g, '/'));
        let time = Date.parse(date.toString());
        return (time/1000);
    }
    // 返回当前的时间戳
    static timestamp_today(): number {
        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);

        let time = Date.parse(date.toString());
        time /= 1000;
        return time;
    }
    // 返回昨天的时间戳
    static timestamp_yesterday(): number {
        let time = this.timestamp_today();
        return (time  - 24 * 60 * 60);
    }
}