export class Hyld {
    // 构造函数
    constructor(id, AcwingOS) {
        // 这个id是前端传进来的div的id
        this.id = id;
        // 我们要找这个div中的id的话，jquery中要使用('#'+id).
        this.$hyld = $('#' + id);
        this.AcwingOS = AcwingOS;


        // 登录注册窗口
        this.settings = new Settings(this);
        // 创建一个菜单界面，赋值给menu
        this.menu = new HyldMenu(this);
        // 创建一个游戏，赋值给playground
        this.playground = new HyldPlayground(this);

        this.start();
    }

    start() {
    }
}
