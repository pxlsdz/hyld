class HyldMenu {
    //构造函数，除了主类Hyld中传id参数，其他类都传root参数，就是创建对象时并进行初始化
    constructor(root) {
        this.root = root;
        // 创建一个menu对象，$可加可不加，加上可以标记是html对象，用来区分普通对象，在$(`...`)
        this.$menu = $(`
            <div class="hyld-menu">
                <div class="hyld-menu-field">
                    <div class="hyld-menu-field-item hyld-menu-field-item-single-mode">
                        单人模式
                    </div>
                    <br>
                    <div class="hyld-menu-field-item hyld-menu-field-item-multi-mode">
                        多人模式
                    </div>
                    <br>
                    <div class="hyld-menu-field-item hyld-menu-field-item-settings">
                        退出
                    </div>
                </div>
            </div>`);     
        // 将网页对象放进浏览器
        this.root.$hyld.append(this.$menu);
        // 找到上方html对象定义的三个按钮
        this.$single_mode = this.$menu.find('.hyld-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.hyld-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.hyld-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}
//存放所有对象(物体)的数组
let HYLD_OBJECTS = [];

class HyldObject {
    constructor() {
        //每创建一个对象都把它加进数组里
        HYLD_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔
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
        for (let i = 0; i < HYLD_OBJECTS.length; i ++ ) {
            if (HYLD_OBJECTS[i] === this) {
                HYLD_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
//用递归的结构，保证每一帧都调用一次函数,即一直无限渲染
let HYLD_ANIMATION = function(timestamp) {
    //每一帧要遍历所有物体，让每个物体执行update函数
    for (let i = 0; i < HYLD_OBJECTS.length; i ++ ) {
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

class GameMap extends HyldObject { // 继承游戏引擎，这个类是游戏地图，涉及到游戏地图的颜色，形状，等等
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);// canvas是一个图形绘制的标签，只是图形容器，需要使用脚本来绘制图形。
        console.log("map");
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {// 渲染函数
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // 填充颜色，0.2是透明度，产生一个渐变的过程
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);// 画一个长方形
    }
}
class Player extends HyldObject {
    /**
     *
     * @param playground 该玩家在哪个地图上
     * @param x 玩家的位置坐标，将来还可能有3d的z轴和朝向坐标
     * @param y
     * @param radius 圆的半径，每个玩家用圆表示
     * @param color 圆的颜色
     * @param speed 玩家的移动速度，用每秒移动高度的百分比表示，因为每个浏览器的像素表示不一样
     * @param is_me 判断当前角色是自己还是敌人
     */
    constructor(playground, x, y, radius, color, speed, is_me) {
        // speed 我们用高度的百分比来表示移动的速度
        //is_me 因为自己和敌人的操作方式是不一样的，需要加一个标签来判断一下是否是自己
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 画布的一个引用
        this.x = x;
        this.y = y;
        this.vx = 0; // 移动速度
        this.vy = 0; // 移动速度
        this.damage_x = 0; // 收到的攻击的位置
        this.damage_y = 0;
        this.damage_speed = 0; //攻速
        this.move_length = 0; //玩家移动的距离
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; // 一个浮点运算的标记，小于eps就算是零
        this.friction = 0.9; // 摩擦力
        this.spent_time = 0; // 保护期

        this.cur_skill = null; // 标记当前是否选中技能（未来会有多个技能）
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }
    // 监听函数
    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {// 关闭右键菜单
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {// 将鼠标右键和该函数绑定
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {// 右键是3，滚轮2，左键是1
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null; // 释放技能后清空
            }
        });

        $(window).keydown(function(e) {// 监听键盘按键
            if (e.which === 81) {  // 查询keycode可以查到每个键盘按键的值
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    //在定义了技能后添加的攻击函数
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2) { //求距离
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) { // 移动到tx，ty
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle); // x y轴上的速度
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        //释放粒子
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    update() {
        this.spent_time += this.timedelta / 1000; // 保护期累加
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            // 随机选中一名玩家，攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 对其行动轨迹预判
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                // 两帧间的移动距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                // 这个意思是，我们要形成一个移动的动画，所以每帧都移动一点点，this.speed * this.timedelta / 1000就是每次移动的一点点
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() { // 渲染函数，画一个圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class Particle extends HyldObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        // speed 我们用高度的百分比来表示移动的速度
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved; // 要移动的距离记得更新
        this.render();
    }

    render() {
        this.ctx.beginPath(); // 画一个圆
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class FireBall extends HyldObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        // player 是谁发射的火球
        // damage 伤害值 
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) { // 火球消失了
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class HyldPlayground {
    constructor(root) {
        this.root = root;
        // this.$playground = $(`<div>游戏界面</div>`);
        this.$playground = $(`<div class="hyld-playground"></div>`);
        this.hide();

        this.start();
    }

    get_random_color() { // 随机颜色函数
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
    }
    show() {  // 打开playground界面
        this.$playground.show();
        this.root.$hyld.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = []; // 存一下当前的游戏玩家
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++ ) { // 初始化5个AI玩家
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

export class Hyld {
    // 构造函数
    constructor(id) {
        // 这个id是前端传进来的div的id
        this.id = id;
        // 我们要找这个div中的id的话，jquery中要使用('#'+id).
        this.$hyld = $('#' + id);
        // 创建一个菜单界面，赋值给menu
        this.menu = new HyldMenu(this);
        // 创建一个游戏，赋值给playground
        this.playground = new HyldPlayground(this);

        this.start();
    }

    start() {
    }
}
