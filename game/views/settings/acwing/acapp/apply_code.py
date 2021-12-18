from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    app_id = "820"
    redirect_uri = quote("https://app820.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)  # 有效期2个小时
    return JsonResponse({
        'result': "success",
        'appid': app_id,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })
