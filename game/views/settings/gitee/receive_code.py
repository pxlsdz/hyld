from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from urllib.parse import quote
from django.contrib.auth import login
from random import randint


def receive_code(request):
    data = request.GET
    code = data.get('code', '')
    state = data.get('state', '')

    # 如果请求失败，code拿不到值，就用空字符串代替，故用户拒绝后也能重定向到回调地址处。
    if not cache.has_key(state) or code == '':
        return redirect("index")

    cache.delete(state)

    request_access_token_url = "https://gitee.com/oauth/token/"
    params = {
        'grant_type': "authorization_code",
        'code': code,
        'client_id': "eb9490128b337c39bf959602929507dfda596a1c9c42a9c19bdfcb511e49ad18",
        'redirect_uri': "http://121.199.59.80/settings/gitee/receive_code/",
        'client_secret': "df661de109a6805d3c1afe20641e74ed1f0222bd5eba9996cbffae8e0c9b56a2"
    }
    access_token_res = requests.post(request_access_token_url, params=params).json()
    access_token = access_token_res['access_token']
    get_userinfo_url = "https://gitee.com/api/v5/user/"
    params = {
        'access_token': access_token,
    }

    message = requests.get(get_userinfo_url, params=params)
    userinfo_res = message.json()

    id = userinfo_res.get('id')
    username = userinfo_res.get('name')
    photo = userinfo_res.get('avatar_url')

    # 这里判断用户之前是否授权注册过，防止数据冗余
    players = Player.objects.filter(openid=id)
    if players.exists():
        # 每次授权并将头像更新一遍。
        Player.objects.filter(openid=id).update(photo=photo)
        login(request, players[0].user)
        return redirect("index")

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    Player.objects.create(user=user, photo=photo, openid=id)

    login(request, user)

    return redirect("index")
