from django.urls import path
from game.views.settings.gitee.apply_code import apply_code as gitee_apply_code
from game.views.settings.gitee.receive_code import receive_code as gitee_receive_code

urlpatterns = [
    path("apply_code/", gitee_apply_code, name="settings_gitee_apply_code"),
    path("receive_code/", gitee_receive_code, name="settings_gitee_receive_code"),
]
