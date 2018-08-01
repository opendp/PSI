from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', auth_views.login,  {'template_name': 'login.html'}, name='login'),
    path('logout', auth_views.logout, {'next_page': '/'}, name='logout'),
]