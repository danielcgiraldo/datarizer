# app/urls.py
from django.urls import path

from app.views import index, session
from app.controllers import *

urlpatterns = [
    path('', index),
    path('session/<slug:session>/', session),
    path('api/add/<slug:event>', create_event),
]