from django.urls import path, re_path
from django.contrib import admin
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [

    # for k8s healthchecks
    re_path(r'^monitoring/alive$',
            views.view_monitoring_alive,
            name='view_monitoring_alive'),

    # Test mode, serve the test metadata JSON and XML files
    #
    re_path(r'^getData$', views.getData, name='getData'),
    re_path(r'^getXML$', views.getXML, name='getXML'),

    # serve templates from the "/templates/content"
    #    directory in this project
    #
    re_path(r'^content/(?P<page_name>[\w\-\._]+)$',
            views.view_content_page,
            name='viewContentPage'),

    re_path(r'^content/$',
            views.view_content_page,
            name='viewContentPageBase'),

    # Serve the home page
    #
    re_path(r'^', views.interface, name='interface'),

    # re_path(r'^%s' % views.ROOK_FILES_PATH, # 'rook-files/'
    # 	views.view_rook_file_passthrough,
    # 	name='view_rook_file_passthrough'),
]
