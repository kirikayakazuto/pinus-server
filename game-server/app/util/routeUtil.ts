
import { dispatch} from './dispatcher';
import { Session, Application } from 'pinus';

export function chat(session: Session, msg: any, app: Application, cb: (err: Error , serverId ?: string) => void) {
    let chatServers = app.getServersByType('chat');

    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }

    // let res = dispatch(session.get('rid'), chatServers);     // 没有rid 会报undifne
    let res = dispatch("1", chatServers);   // 应为只有一个, 报这个返回给他

    cb(null, res.id);
}