# app/urls.py
from django.urls import path

from app.views import index, session, new
from app.controllers import *

urlpatterns = [
    path('', index),
    path('new/', new),
    path('session/<slug:session>/', session),
    path('api/add/<slug:event>', create_event),
    path('api/remove/<slug:event>', remove_event),
    path('api/modify/<slug:event>/<slug:new>', modify_event),
]
