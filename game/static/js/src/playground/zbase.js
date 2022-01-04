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

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).resize(`resize.${uuid}`, function () {
            outer.resize();
        });

        //   关闭窗口，关闭上面对应的
        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function () {
                $(window).off(`resize.${uuid}`);
            });
        }

    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; // 单位

        if (this.game_map) this.game_map.resize();
    }

    show(mode) {  // 打开playground界面
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over
        this.notic_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = []; // 存一下当前的游戏玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 5; i++) { // 初始化5个AI玩家
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);

            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide() {  // 关闭playground界面
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notic_board) {
            this.notic_board.destroy();
            this.notic_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        // 清空对应的html，比如game_map里面
        this.$playground.empty();

        this.$playground.hide();
    }
}

