class Player extends HyldObject {
    /**
     *
     * @param playground 该玩家在哪个地图上
     * @param x 玩家的位置坐标，将来还可能有3d的z轴和朝向坐标
     * @param y
     * @param radius 圆的半径，每个玩家用圆表示
     * @param color 圆的颜色
     * @param speed 玩家的移动速度，用每秒移动高度的百分比表示，因为每个浏览器的像素表示不一样
     */
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        // speed 我们用高度的百分比来表示移动的速度

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

        this.character = character;
        this.username = username;
        this.photo = photo;

        this.eps = 0.01; // 一个浮点运算的标记，小于eps就算是零
        this.friction = 0.9; // 摩擦力
        this.spent_time = 0; // 保护期

        this.cur_skill = null; // 标记当前是否选中技能（未来会有多个技能）
        if (this.character !== "robot") { // 加载头像
            this.img = new Image();
            this.img.src = this.photo;
        }

    }

    start() {
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    // 监听函数
    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {// 关闭右键菜单
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {// 将鼠标右键和该函数绑定
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {// 右键是3，滚轮2，左键是1
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }

                outer.cur_skill = null; // 释放技能后清空
            }
        });

        $(window).keydown(function (e) {// 监听键盘按键
            if (e.which === 81) {  // 查询keycode可以查到每个键盘按键的值
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    //在定义了技能后添加的攻击函数
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
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
        for (let i = 0; i < 20 + Math.random() * 10; i++) {
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
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    update() {
        this.update_move();
        this.render();
    }

    update_move() {  // 更新玩家移动
        this.spent_time += this.timedelta / 1000; // 保护期累加
        if (this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            // 随机选中一名玩家，攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // 对其行动轨迹预判
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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
    }

    render() { // 渲染函数，画一个圆或以图片当头像
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
