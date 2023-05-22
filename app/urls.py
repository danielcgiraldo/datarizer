# app/urls.py
from django.urls import path

from app.views import index, session, new
from app.controllers.events import *
from app.controllers.export import export_data

# Define the URL paths for the app

urlpatterns = [
    path('', index),
    path('new/', new),
    path('session/<slug:session>/', session),
    path('api/add/<slug:event>', create_event),
    path('api/remove/<slug:event>', remove_event),
    path('api/edit/<slug:event>/<slug:new>', edit_event),
    path('api/log/<slug:event>', log_event),
    path('api/export', export_data)
]
