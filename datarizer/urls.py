from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from datarizer import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
]

# Serve static files in Vercel
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
