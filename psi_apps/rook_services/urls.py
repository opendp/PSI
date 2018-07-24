from django.urls import path, re_path

from . import views

urlpatterns = [
    re_path(r'^(?P<app_name_in_url>(\w|-){5,25})$',
        views.view_rook_route,
		name='view_rook_route'),
]