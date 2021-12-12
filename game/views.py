from django.http import HttpResponse


def index(request):
    line1 = '<h1 style="text-align: center">乱斗荒野</h1>'
    line4 = '<a href="/play/">进入游戏界面</a>'
    line3 = '<hr>'
    line2 = '<img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimages.miniyxw.com%2Fdfgame%2F202006%2F14%2F1592105580_3.jpg&refer=http%3A%2F%2Fimages.miniyxw.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641901823&t=c484fe4c2d5456226453ba2a0d6b1fcc" width=2000>'
    return HttpResponse(line1 + line4 + line3 + line2)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line3 = '<a href="/">返回主页面</a>'
    line2 = '<img src="https://img0.baidu.com/it/u=628478910,211804774&fm=26&fmt=auto" width=2000>'
    return HttpResponse(line1 + line3 + line2)

