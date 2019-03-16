"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 使用数字实现的简单的队列
 */
class Queue {
    constructor(limit) {
        this.limit = 0;
        this.length = 0;
        this.head = 0;
        this.tail = 0;
        this._array = new Array(this.limit);
        this.limit = limit || 1000;
    }
    push(e) {
        if (this.length >= this.limit) {
            return false;
        }
        this._array[this.tail] = e;
        this.tail++;
        this.length++;
        if (this.tail == this._array.length) {
            this.tail = 0;
        }
        return true;
    }
    pop() {
        if (this.length == 0) {
            return null;
        }
        let e = this._array[this.head];
        this.head++;
        this.length--;
        if (this.head == this._array.length) {
            this.head = 0;
        }
        return e;
    }
    getSize() {
        return this.length;
    }
}
exports.default = Queue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbC9RdWV1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOztHQUVHO0FBQ0g7SUFDSSxZQUFZLEtBQWM7UUFJbEIsVUFBSyxHQUFHLENBQUMsQ0FBQztRQUNWLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxTQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ1QsU0FBSSxHQUFHLENBQUMsQ0FBQztRQUNULFdBQU0sR0FBRyxJQUFJLEtBQUssQ0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFQdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDO0lBQy9CLENBQUM7SUFRTSxJQUFJLENBQUMsQ0FBSTtRQUNaLElBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQzFCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUcsQ0FBQztRQUNiLElBQUksQ0FBQyxNQUFNLEVBQUcsQ0FBQztRQUVmLElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFJLENBQUMsQ0FBQztTQUNsQjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxHQUFHO1FBQ04sSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksRUFBRyxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sRUFBRyxDQUFDO1FBRWYsSUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0o7QUEzQ0Qsd0JBMkNDIn0=