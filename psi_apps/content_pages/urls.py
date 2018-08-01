from django.urls import path, re_path
from django.contrib import admin
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path('', views.interface, name='interface'),
    path('psiIntroduction', views.psiIntroduction, name='psiIntroduction'),
    path('psiOpen', views.psiOpen, name='psiOpen'),
    path('psiOpenPrototype', views.psiOpenPrototype, name='psiOpenPrototype'),
    path('getData', views.getData, name='getData'),
    path('getXML', views.getXML, name='getXML'),

    # re_path(r'^%s' % views.ROOK_FILES_PATH, # 'rook-files/'
    # 	views.view_rook_file_passthrough,
    # 	name='view_rook_file_passthrough'),
]