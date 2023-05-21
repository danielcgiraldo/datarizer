# app/urls.py
from django.urls import path

from app.views import index, session, new
from app.controllers import *

urlpatterns = [
    path('', index),
    path('new/', new),
    path('session/<slug:session>/', session),
    path('api/add/<slug:event>', create_event),
]
