from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render, get_object_or_404, redirect


def interface(request):
    return render(request, 'interface.html')