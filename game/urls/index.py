from django.urls import path, include
from game.views.index import index,hyld

urlpatterns = [
        path("", index, name = "index"),
        path("hyld/", hyld, name = "hyld"),
        path("menu/", include("game.urls.menu.index")),
        path("playground/", include("game.urls.playground.index")),
        path("settings/", include("game.urls.settings.index")),
]
