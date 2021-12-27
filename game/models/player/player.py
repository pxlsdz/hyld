from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    # OneToOneField 表示一一对应， on_delete=models.CASCADE 表示当数据被删掉时,Player 一起被删掉。
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    score = models.IntegerField(default=1500)

    def __str__(self):
        return str(self.user)
