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
                    <div class="hyld-menu-field-item hyld-menu-field-item-team-mode">
                        组队模式
                    </div>
                    <br>
                    <div class="hyld-menu-field-item hyld-menu-field-item-settings">
                        退出
                    </div>
                </div>
            </div>`);
        this.$menu.hide();
        // 将网页对象放进浏览器
        this.root.$hyld.append(this.$menu);
        // 找到上方html对象定义的三个按钮
        this.$single_mode = this.$menu.find('.hyld-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.hyld-menu-field-item-multi-mode');
        this.$team_mode = this.$menu.find('.hyld-menu-field-item-team-mode');
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
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$team_mode.click(function(){
            outer.hide();
            outer.root.playground.show("team mode");
        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}
