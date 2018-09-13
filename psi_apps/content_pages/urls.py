from django.urls import path, re_path
from django.contrib import admin
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    re_path(r'^psiIntroduction$', views.psiIntroduction, name='psiIntroduction'),
    re_path(r'^psiOpen$', views.psiOpen, name='psiOpen'),
    re_path(r'^psiOpenPrototype$', views.psiOpenPrototype, name='psiOpenPrototype'),
    re_path(r'^getData$', views.getData, name='getData'),
    re_path(r'^getXML$', views.getXML, name='getXML'),

    # for k8s healthchecks
    re_path(r'^monitoring/alive$',
            views.view_monitoring_alive,
            name='view_monitoring_alive'),

    re_path(r'^', views.interface, name='interface'),
    # re_path(r'^%s' % views.ROOK_FILES_PATH, # 'rook-files/'
    # 	views.view_rook_file_passthrough,
    # 	name='view_rook_file_passthrough'),
]
