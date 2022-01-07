class ScoreBoard extends HyldObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;  // win: 胜利，lose：失败

        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";

        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    }

    start() {
    }

    update() {
        if (this.playground.state === "fighting")
            this.update_win_lose();
    }

    update_win_lose() {
        if (this.playground.players.length > 0) {
            let is_win = true;
            let win_team_id = this.playground.players[0].team_id;
            for (let i = 1; i < this.playground.players.length; i++) {
                if (win_team_id !== this.playground.players[i].team_id) {
                    is_win = false;
                    break
                }
            }
            // console.log(win_team_id, is_win, this.playground.team_id);
            if (is_win) {
                if (win_team_id === this.playground.team_id) {
                    this.playground.state = "over";
                    this.playground.score_board.win();
                } else {
                    this.playground.state = "over";
                    this.playground.score_board.lose();
                }
            }
        }

    }

    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function () {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";

        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";

        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 1000);
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }

}
