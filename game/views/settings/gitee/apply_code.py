from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


# 申请code， 返回重定向的apply_code_uri

def apply_code(request):
    client_id = "eb9490128b337c39bf959602929507dfda596a1c9c42a9c19bdfcb511e49ad18"
    redirect_uri = quote("http://121.199.59.80/settings/gitee/receive_code/")
    state = get_state()

    cache.set(state, True, 7200) #有效期是2小时。

    apply_code_url = "https://gitee.com/oauth/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?client_id=%s&redirect_uri=%s&response_type=code&state=%s" % (client_id, redirect_uri, state)
    })
