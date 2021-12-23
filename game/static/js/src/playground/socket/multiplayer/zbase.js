class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app820.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }
    // 接收后端发来的创建玩家消息
    receive () {
        let outer = this;

        this.ws.onmessage = function(e) {

            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            // 判断是否是自己
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        };
    }

    // 向服务器发送创建用户消息
    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }


    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        //每一个对象的uuid等于创建它窗口的uuid
        player.uuid = uuid;
        this.playground.players.push(player);
    }
}
