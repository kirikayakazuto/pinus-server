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
}
exports.default = utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbC91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFXO1FBQzVCLElBQUksTUFBTSxHQUFXLGdFQUFnRSxDQUFDO1FBRXRGLElBQUksTUFBTSxHQUFXLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbkMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBWEQsd0JBV0MifQ==