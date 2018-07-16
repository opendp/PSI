from django.urls import path

from . import views

urlpatterns = [
    path('', views.interface, name='interface'),
    path('psiIntroduction', views.psiintroduction, name='psiintroduction'),
]