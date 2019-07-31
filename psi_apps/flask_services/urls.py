from django.urls import path, re_path

from . import views

urlpatterns = [

    re_path(r'^download-files\/(?P<filename>(\w|-|\.){5,25})$',
            views.download_from_volume,
            name='download_from_volume'),

    re_path(r'^(?P<app_name_in_url>(\w|-|\.){5,25})$',
            views.view_flask_route,
            name='view_flask_route'),

]