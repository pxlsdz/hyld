from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        # 枚举可用房间
        for i in range(1000):
            name = "room-%d" % i
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name:
            return

        await self.accept()

        # 创建房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)  # 房间有效期一小时

        # 服务器向房间里其他玩家客户端发送玩家信息
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):  # 大概率断开连接时调用
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })

        cache.set(self.room_name, players, 3600)  # 相对于最后一个进入游戏玩家，房间有效期一小时

        # 向房间内所有玩家发送
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",  # 重要消息，下方的函数名就为type变量的值
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )

    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))

    # 接收前端信息
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
