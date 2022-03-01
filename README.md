



# 项目介绍

一个网页端在线对战游戏，支持单人模式、多人匹配、组队匹配、在线聊天室等功能，提供了玩家积分机制，以 及根据积分自动匹配的机制。

# 项目地址

> **源码地址**：https://gitee.com/pxlsdz/hyld
>
> **演示地址**：http://121.199.59.80
>
> **测试地址(多人匹配和组队匹配功能)**:http://121.199.59.80/test/



# 项目技术选型

1. 前端游戏逻辑部分借鉴 `Unity3D` 引擎思想采用 `JavaScript` 开发，实现攻击、闪现等技能; 
2. 后端登录系统和积分系统由 `Django` 框架开发，`Redis` 储存与 `WebSocket` 同步每局玩家界面对战信息; 
3. 匹配机制由匹配池和消息队列组成，随匹配时间自适应地进行用户匹配，使用 `Thrift` 多线程与后端交互。



# 博客介绍

[0、配置docker、git环境与django项目创建](https://www.cnblogs.com/pxlsdz/p/15696178.html)

[1、简易版web端荒野乱斗菜单界面](https://www.cnblogs.com/pxlsdz/p/15700608.html)

[2、简易版web端荒野乱斗游戏界面](https://www.cnblogs.com/pxlsdz/p/15720779.html))

[3、部署nginx与配置uwsgi以及推荐Acwing域名](https://www.cnblogs.com/pxlsdz/p/15723176.html)

[4、简易版web端荒野乱斗账户系统](https://www.cnblogs.com/pxlsdz/p/15725765.html)

[5、django实现第三方登录一gitee码云](https://www.cnblogs.com/pxlsdz/p/15729721.html)

 [6、实现联机对战上](https://www.cnblogs.com/pxlsdz/p/15737926.html)

 [7、联机对战下](https://www.cnblogs.com/pxlsdz/p/15758040.html)

[8、聊天系统](https://www.cnblogs.com/pxlsdz/p/15916581.html)

[9、匹配系统-thrift实现](https://www.cnblogs.com/pxlsdz/p/15779437.html)

[10、战绩系统与界面优化](https://www.cnblogs.com/pxlsdz/p/15795658.html)

