from django.shortcuts import render


def index(request):
    return render(request, "multiends/web.html")


def hyld(request):
    return render(request, "multiends/web.html")
