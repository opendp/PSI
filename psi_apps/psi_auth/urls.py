from django.contrib import admin
from django.urls import re_path, path, include
from django.conf import settings
from django.conf.urls.static import static
from psi_apps.content_pages.views_old import view_about_page
from . import views

urlpatterns = [\

    re_path(r'^signup', views.sign_up.as_view(), name='signup'),

    re_path(r'^test_user', views.test_user, name='test_user')
    ]
