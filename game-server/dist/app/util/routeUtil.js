"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dispatcher_1 = require("./dispatcher");
function chat(session, msg, app, cb) {
    let chatServers = app.getServersByType('chat');
    if (!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    // let res = dispatch(session.get('rid'), chatServers);     // 没有rid 会报undifne
    let res = dispatcher_1.dispatch("1", chatServers); // 应为只有一个, 报这个返回给他
    cb(null, res.id);
}
exports.chat = chat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVVdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3V0aWwvcm91dGVVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkNBQXVDO0FBR3ZDLGNBQXFCLE9BQWdCLEVBQUUsR0FBUSxFQUFFLEdBQWdCLEVBQUUsRUFBNkM7SUFDNUcsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRS9DLElBQUcsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDekMsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztRQUM1QyxPQUFPO0tBQ1Y7SUFFRCw4RUFBOEU7SUFDOUUsSUFBSSxHQUFHLEdBQUcscUJBQVEsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBRyxrQkFBa0I7SUFFMUQsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIsQ0FBQztBQVpELG9CQVlDIn0=