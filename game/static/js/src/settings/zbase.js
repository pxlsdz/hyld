class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="hyld-settings">
    <div class="hyld-settings-login">
        <div class="hyld-settings-title">
            登录
        </div>
        <div class="hyld-settings-username">
            <div class="hyld-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="hyld-settings-password">
            <div class="hyld-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="hyld-settings-submit">
            <div class="hyld-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="hyld-settings-error-message">
        </div>
        <div class="hyld-settings-option">
            注册
        </div>
        <br>
        <div class="hyld-settings-acwing">
            <img width="30" src="https://app820.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="hyld-settings-register">
        <div class="hyld-settings-title">
            注册
        </div>
        <div class="hyld-settings-username">
            <div class="hyld-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="hyld-settings-password hyld-settings-password-first">
            <div class="hyld-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="hyld-settings-password hyld-settings-password-second">
            <div class="hyld-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="hyld-settings-submit">
            <div class="hyld-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="hyld-settings-error-message">
        </div>
        <div class="hyld-settings-option">
            登录
        </div>
        <br>
        <div class="hyld-settings-acwing">
            <img width="30" src="https://app820.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".hyld-settings-login");
        this.$login_username = this.$login.find(".hyld-settings-username input");
        this.$login_password = this.$login.find(".hyld-settings-password input");
        this.$login_submit = this.$login.find(".hyld-settings-submit button");
        this.$login_error_message = this.$login.find(".hyld-settings-error-message");
        this.$login_register = this.$login.find(".hyld-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".hyld-settings-register");
        this.$register_username = this.$register.find(".hyld-settings-username input");
        this.$register_password = this.$register.find(".hyld-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".hyld-settings-password-second input");
        this.$register_submit = this.$register.find(".hyld-settings-submit button");
        this.$register_error_message = this.$register.find(".hyld-settings-error-message");
        this.$register_login = this.$register.find(".hyld-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find('.hyld-settings-acwing img')

        this.root.$hyld.append(this.$settings);

        this.start();
    }

    start() {
        if (this.platform == "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote();
        });
        this.$acwing_login.click(function () {
            outer.acwing_login();
        })
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function () {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }

    login_on_remote() {  // 在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    acwing_login() {// 申请acwing第三方登录
        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    acapp_login(appid, redirect_uri, scope, state) { // 调用AcWingOS登录授权API
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }


    getinfo_acapp() { // 向后端申请code
        let outer = this;
        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;

        $.ajax({
            url: "https://app820.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }


}
