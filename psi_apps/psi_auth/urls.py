from django.urls import re_path, path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    re_path(r'^login', auth_views.login, name='login'),
    re_path(r'^register/', views.register, name='register'),
    re_path(r'^logout', auth_views.logout, {'next_page': '/'}, name='logout'),
]