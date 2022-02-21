from django.shortcuts import render

def index(request):
    return render(request, "multiends/index.html")

def hyld(request):
    return render(request, "multiends/web.html")