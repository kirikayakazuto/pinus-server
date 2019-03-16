/**
 * 使用数字实现的简单的队列
 */
export default class Queue<T> {
    constructor(limit?: number) {
        this.limit = limit || 1000;
    }

    private limit = 0;
    private length = 0;
    private head = 0;
    private tail = 0;
    private _array = new Array<T>(this.limit);

    public push(e: T) {
        if(this.length >= this.limit) {
            return false;
        }

        this._array[this.tail] = e;
        this.tail ++;
        this.length ++;

        if(this.tail == this._array.length) {
            this.tail  = 0;
        }
        return true;
    }

    public pop() {
        if(this.length == 0) {
            return null;
        }
        let e = this._array[this.head];
        this.head ++;
        this.length --;

        if(this.head == this._array.length) {
            this.head = 0;
        }
        return e;
    }

    public getSize() {
        return this.length;
    }
}