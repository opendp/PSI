import json
import urllib
from os.path import isfile, join
import os
import mimetypes

# from django.conf import settings
from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse, Http404, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from psi_apps.utils.file_helper import load_file_as_json, load_file_contents
from psi_apps.utils.view_helper import \
    (get_json_error, get_json_success)

def interface(request):
    """Return the interface.html template"""
    info_dict = dict(ROOK_SVC_URL=settings.ROOK_SVC_URL)
    return render(request,
                  'interface.html',
                  info_dict)

def psiIntroduction(request):
    """Return the psiIntroduction.html template"""
    return render(request,
                  'content/psiIntroduction.html')

def psiOpen(request):
    """Return the psiOpen.html template"""
    return render(request,
                  'content/psiOpen.html')

def psiOpenPrototype(request):
    """Return the psiOpenPrototype.html template"""
    return render(request,
                  'content/psiOpenPrototype.html')

def getData(request):
    """Return a default/test preprocess file: preprocess_4_v1-0.json"""
    fpath = join(settings.PSI_DATA_DIRECTORY_PATH,
                 'preprocess_4_v1-0.json')

    json_info = load_file_as_json(fpath)
    if not json_info.success:
        return JsonResponse(get_json_error(json_info.err_msg))

    return JsonResponse(json_info.result_obj)

    #
    #return JsonResponse(\
    #            get_json_success('success',
    #                             data=json_info.result_obj))


def getXML(request):
    """Return the default/test xml data: pumsmetaui.xml"""
    #file = open(os.path.join(settings.BASE_DIR, "data/pumsmetaui.xml"))
    #return HttpResponse(file.read())
    fpath = join(settings.PSI_DATA_DIRECTORY_PATH,
                 'pumsmetaui.xml')

    file_info = load_file_contents(fpath)
    if not file_info.success:
        return JsonResponse(get_json_error(file_info.err_msg))

    return HttpResponse(file_info.result_obj,
                        content_type="application/xml")

    #return JsonResponse(\
    #            get_json_success('success',
    #                             data=json_info.result_obj))


def view_monitoring_alive(request):
    """For kubernetes liveness check"""
    return JsonResponse(dict(status="ok",
                             message="PSI python server up"))



## LOAD LOCAL DATA

# ROOK_FILES_PATH = 'data/preprocess_4_v1-0.json'

# def get_rook_file_url(req_file_path):
#     # start with something like:
#     # http://127.0.0.1:8080/rook-custom/rook-files/o_196seed/preprocess/preprocess.json
#     #
#     idx = req_file_path.find(ROOK_FILES_PATH)
#     if idx > -1:
#         # shorten it to: "rook-files/data/d3m/o_196seed/preprocess.json"
#         req_file_path = req_file_path[idx:]

#     # doublecheck there's no prepended "/"
#     #
#     if req_file_path.startswith('/') and len(req_file_path) > 1:
#         req_file_path = req_file_path[1:]

#     # set the rook url
#     #
#     rook_file_url = '{0}{1}'.format(settings.R_DEV_SERVER_BASE,
#                                     req_file_path)

#     return rook_file_url

# def view_rook_file_passthrough(request):
# 	"""A bit ugly, download the file content from rook and
# 	send it to the UI
# 	http://127.0.0.1:8080/rook-custom/rook-files/data/d3m/o_196seed/preprocess.json
# 	"""
# 	req_file_path = request.get_full_path()
# 	print(req_file_path)
# 	filename = req_file_path.split('/')[-1]
# 	print(filename)
# 	rook_file_url = get_rook_file_url(req_file_path)


# 	# Read the file content into memory (assuming small files in dev)
# 	try:
# 	    file_content = urllib.request.urlopen(rook_file_url).read()
# 	except urllib.error.HTTPError as ex_obj:
# 	    err_msg = ('Failed to download rook file.'
# 	               ' HTTPError: %s \n\nurl: %s') % (str(ex_obj), rook_file_url)
# 	    raise Http404('file not found: %s' % rook_file_url)
# 	    return JsonResponse(dict(status=False,
# 	                             error_message=err_msg))
# 	except urllib.error.URLError as ex_obj:
# 	    err_msg = ('Failed to download rook file.'
# 	               ' URLError: %s \n\nurl: %s') % (str(ex_obj), rook_file_url)
# 	    return JsonResponse(dict(status=False,
# 	                             error_message=err_msg))

# 	# get the filesize and content type
# 	#
# 	content_type = mimetypes.guess_type(filename)[0]

# 	# prepare the response
# 	#
# 	response = HttpResponse(file_content,
# 	                        content_type=content_type)

# 	#response['Content-Disposition'] = "attachment; filename={0}".format(filename)
# 	filesize = len(file_content)
# 	response['Content-Length'] = filesize
# 	return response
