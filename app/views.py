# example/views.py
from django.template import loader
from django.http import HttpResponse


def index(request):
    return HttpResponse(loader.get_template('default.html').render({"user": False}))
