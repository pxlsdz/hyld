from django.shortcuts import render


def index(request):
    return render(request, "multiends/web.html")


def test(request):
    return render(request, "multiends/index.html")
