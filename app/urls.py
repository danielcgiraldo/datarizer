# app/urls.py
from django.urls import path

from app.views import index, session


urlpatterns = [
    path('', index),
    path('session/<slug:session>/', session),
]