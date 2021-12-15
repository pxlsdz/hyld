class HyldPlayground {
    constructor(root) {
        this.root = root;
        // this.$playground = $(`<div>游戏界面</div>`);
        this.$playground = $(`<div class="hyld-playground"></div>`);
        // this.hide();

        this.root.$hyld.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = []; // 存一下当前的游戏玩家
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++ ) { // 初始化5个AI玩家
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

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
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

