//存放所有对象(物体)的数组
let HYLD_OBJECTS = [];

class HyldObject {
    constructor() {
        //每创建一个对象都把它加进数组里
        HYLD_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔
        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }

    start() {  // 只会在第一帧执行一次，对当前界面进行一次初始化——玩家的属性值，颜色等等
    }

    update() {  // 每一帧均会执行一次，玩家移动，或者发动技能，每一帧都要进行更新
    }

    on_destroy() {  // 在被销毁前执行一次，当有玩家被杀掉后，有的玩家要加分等等一系列的操作
    }

    destroy() {  // 删掉某个已经死掉的玩家
        this.on_destroy();
        //遍历一遍所有对象，找到当前对象并删除
        for (let i = 0; i < HYLD_OBJECTS.length; i++) {
            if (HYLD_OBJECTS[i] === this) {
                HYLD_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
//用递归的结构，保证每一帧都调用一次函数,即一直无限渲染
let HYLD_ANIMATION = function (timestamp) {
    //每一帧要遍历所有物体，让每个物体执行update函数
    for (let i = 0; i < HYLD_OBJECTS.length; i++) {
        let obj = HYLD_OBJECTS[i];
        //用has_called_start标记每个物体，保证每一帧，每个物体只执行一次函数
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            //算出2次调用的间隔时间，为计算速度做准备
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(HYLD_ANIMATION);
}
requestAnimationFrame(HYLD_ANIMATION);

