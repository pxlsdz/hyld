import os

# 设置环境变量,越靠前越好
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hyld.settings')
django.setup()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from game.routing import websocket_urlpatterns

from channels.layers import get_channel_layer

# 实现在函数外面依旧可以访问channel功能，即可以在匹配进程调用websocket服务
channel_layer = get_channel_layer()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
})
