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
}