# example/views.py
import datetime
from django.template import loader
from django.http import HttpResponse


def index(request):
    dt = datetime.datetime.now().strftime("%Y-%m-%d")
    return HttpResponse(loader.get_template('default.html').render({"user": False, "dt": dt}))
