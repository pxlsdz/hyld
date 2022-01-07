#! /usr/bin/env python3

import glob
import sys

# sys.path.append('gen-py')
# 将django的家目录加到import包里
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

#  线程安全（同步，读写不会发生冲突）的队列
from queue import Queue

from time import sleep
from threading import Thread
from hyld.asgi import channel_layer
# 并行变为串行
from asgiref.sync import async_to_sync
from django.core.cache import cache

# 消息队列异步接收玩家信息，匹配池在这里面取消息
queue = Queue()


class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0  # 等待时间，时间越长，条件越低


# 匹配池
class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        print("add player:%s %d" % (player.username, player.score))
        self.players.append(player)

    def check_match(self, a, b):
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s %s" % (ps[0].username, ps[1].username, ps[2].username,  ps[3].username))
        room_name = "room-%s-%s-%s-%s" % (ps[0].uuid, ps[1].uuid, ps[2].uuid, ps[3].uuid)
        players = []
        i = 0
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100,
                'team_id': i % 2
            })
            i += 1
        cache.set(room_name, players, 3600)

        i = 0
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                    'team_id': i % 2
                }
            )
            i += 1

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        while len(self.players) >= 4:
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 3):
                a, b, c, d = self.players[i], self.players[i + 1], self.players[i + 2], self.players[i + 3]
                if self.check_match(a, b) and self.check_match(a, c) and self.check_match(b, c) and self.check_match(c, d):
                    self.match_success([a, b, d, c])
                    self.players = self.players[:i] + self.players[i + 4:]
                    flag = True
                    break
            if not flag:
                break

        self.increase_waiting_time()


# 接收客户端发来的消息
class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


# get_nowait有就返回，没有就抛出异常
def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None


# 1. 匹配池从消息队列取玩家消息
# 2. 进行匹配服务
def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9091)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # 匹配线程
    # server.serve()是阻塞进程，所以匹配线程写在其上方
    # daemon为守护进程，false的意思主进程关闭，该进程继续执行
    Thread(target=worker, daemon=True).start()

    # 接收消息线程
    # 单线程版本
    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)
    # 多线程限制版本，可能最多只有十个线程
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    print('Starting the server...')
    server.serve()
    print('done.')
