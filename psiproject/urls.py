"""psiproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import re_path, path, include
from django.conf import settings
from django.conf.urls.static import static
from psi_apps.content_pages.views import view_about_page

urlpatterns = [\
    re_path(r'auth/', include('psi_apps.psi_auth.urls')),

    re_path(r'auth/', include('django.contrib.auth.urls')),

    re_path(r'^admin/',
            admin.site.urls),

    re_path(r'^flask-custom/',
            include('psi_apps.flask_services.urls')),

    re_path(r'^about$',
            view_about_page,
            name='view_about_page'),

    re_path(r'^',
            include('psi_apps.content_pages.urls')),]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.TEST_DIRECT_STATIC)
