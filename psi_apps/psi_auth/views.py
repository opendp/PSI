import json 
import urllib
import os
import mimetypes

# from django.conf import settings
from psiproject.settings.base import BASE_DIR
from django.http import HttpResponseRedirect, HttpResponse, Http404, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect

def register(request):
	return render(request, 'registration/signup.html')