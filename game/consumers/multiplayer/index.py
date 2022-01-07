from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from match_system.src.match_server.match_service import Match
from game.models.player.player import Player
# 数据库是串行操作，但这里都是并行函数，需要将数据库改为并行操作
from channels.db import database_sync_to_async


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):  # 大概率断开连接时调用
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data, port):
        self.room_name = None

        # Make socket
        transport = TSocket.TSocket('localhost', port)

        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        # 具体业务代码
        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data["uuid"],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def attack(self, data):
        # 可能回出现极端情况
        if not self.room_name:
            return
        players = cache.get(self.room_name)

        if not players:
            return

        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                player['hp'] -= 25

        # 输赢积分判定
        win_team_id = -1
        is_win = True
        for player in players:
            if player['hp'] > 0:
                if win_team_id == -1:
                    win_team_id = player['team_id']
                else:
                    if win_team_id != player['team_id']:
                        is_win = False
                        break
        if is_win:
            def dp_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()

            for player in players:
                if player['team_id'] != win_team_id:
                    await database_sync_to_async(dp_update_player_score)(player['username'], -5)
                else:
                    await database_sync_to_async(dp_update_player_score)(player['username'], 10)
        else:
            if self.room_name:
                cache.set(self.room_name, players, 3600)

        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "attack",
                'attackee_uuid': data["attackee_uuid"],
                'uuid': data['uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )

    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys('*%s*' % (data['uuid']))
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    # 接收前端信息
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data, 9090)
        elif event == "create_team_player":
            await self.create_player(data, 9091)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
