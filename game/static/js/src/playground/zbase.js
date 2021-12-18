class HyldPlayground {
    constructor(root) {
        this.root = root;
        // this.$playground = $(`<div>游戏界面</div>`);
        this.$playground = $(`<div class="hyld-playground"></div>`);
        this.hide();

        this.root.$hyld.append(this.$playground);

        this.start();
    }

    get_random_color() { // 随机颜色函数
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        let outer = this;
        $(window).resize(function () {
            outer.resize();
        });

    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; //

        if (this.game_map) this.game_map.resize();
    }

    show() {  // 打开playground界面
        this.$playground.show();

        this.resize();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = []; // 存一下当前的游戏玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, true));

        for (let i = 0; i < 5; i++) { // 初始化5个AI玩家
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));
        }

    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

