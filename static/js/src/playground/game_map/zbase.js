class GameMap extends HyldObject { // 继承游戏引擎，这个类是游戏地图，涉及到游戏地图的颜色，形状，等等
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);// canvas是一个图形绘制的标签，只是图形容器，需要使用脚本来绘制图形。
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
