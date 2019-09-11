from django.conf import settings
from django.urls import path, re_path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static

from . import views
from . import views_old

urlpatterns = [

    # START VUE REWRITE
    re_path(r'^vue.*',
            views.application,
            name='application'),

    re_path(r'^listWorkspaces',
            views.list_workspaces,
            name='list-workspaces'),

    re_path(r'^getWorkspace$',
            views.get_workspace,
            name='get-workspace'),
    # END VUE REWRITE


    # for k8s healthchecks
    re_path(r'^monitoring/alive$',
            views_old.view_monitoring_alive,
            name='view_monitoring_alive'),

    # Test mode, serve the test metadata JSON and XML files
    #
    re_path(r'^getData$', views_old.getData, name='getData'),
    re_path(r'^getXML$', views_old.getXML, name='getXML'),

    # serve templates from the "/templates/content"
    #    directory in this project
    #
    re_path(r'^content/(?P<page_name>[\w\-\._]+)$',
            views_old.view_content_page,
            name='viewContentPage'),

    re_path(r'^content/$',
            views_old.view_content_page,
            name='viewContentPageBase'),

    # Serve interactive queries
    re_path(r'^interactive$', views_old.interactive, name='interactive'),

    # Serve the home page
    #
    re_path(r'^', views_old.interface, name='interface'),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL,
                          #document_root=settings.STATIC_ROOT)
                          document_root=settings.TEST_DIRECT_STATIC)
