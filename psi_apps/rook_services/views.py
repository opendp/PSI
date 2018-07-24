import json
import requests
import urllib.parse

from django.http import JsonResponse, HttpResponse, Http404
from psiproject.settings.local import ROOK_SERVER
from django.views.decorators.csrf import csrf_exempt


def view_rook_route(request, app_name_in_url):
	call_entry = None

	rook_svc_url = '{0}{1}'.format(ROOK_SERVER, app_name_in_url)

	decode = request.body.decode('utf-8')
	sendtoR = {'tableJSON':decode}

	try:
		rservice_req = requests.post(rook_svc_url, data=sendtoR)

	except ConnectionError:
	    err_msg = 'R Server not responding: %s' % rook_svc_url
	    if rook_app_info.record_this_call():
	        call_entry.add_error_message(err_msg)
	        call_entry.save()
	    resp_dict = dict(message=err_msg)
	    return JsonResponse(resp_dict)

	# Save request result
	#
	# if True:
	#     if rservice_req.status_code == 200:
	#         call_entry.add_success_message(rservice_req.text,
	#                                        rservice_req.status_code)
	#     else:
	#         call_entry.add_error_message(rservice_req.text,
	#                                      rservice_req.status_code)
	#     call_entry.save()

	print('status code from rook call: %d' % rservice_req.status_code)
	## print('json from rook cool: %s' % rservice_req.json())

	return JsonResponse(rservice_req.json())