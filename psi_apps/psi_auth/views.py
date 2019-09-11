from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login
from django.urls import reverse_lazy, reverse
from django.views import generic
from psi_apps.content_pages.views_old import interface
from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from .forms import CustomUserCreationForm


class sign_up(generic.CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('interface')
    template_name = 'registration/signup.html'

def test_user(request):
	user = authenticate(request, username='test', password='adminadmin')
	if user is not None:
		login(request, user)
		return redirect('interface')
		# interface(request)
	else:
		return render(request, 'login.html')
	#return render(request, 'login.html', {username: 'test', password: 'adminadmin'})
