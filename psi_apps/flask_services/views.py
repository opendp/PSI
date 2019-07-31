import json
import requests
import os

from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from psi_apps.utils.view_helper import \
    (get_json_error, get_json_success)


@login_required(login_url='login')
def view_flask_route(request, app_name_in_url):
    """Route the call to Flask and back"""

    print('routing flask')
    print(app_name_in_url)

    flask_svc_url = '{0}{1}'.format(settings.FLASK_SERVER_BASE, app_name_in_url)

    print('rook_svc_url', flask_svc_url)

    try:
        rservice_req = requests.post(flask_svc_url, json=json.loads(request.body))
    except ConnectionError:
        user_msg = 'Flask Server not responding: %s' % flask_svc_url
        print('err_msg', user_msg)
        return JsonResponse(get_json_error(user_msg))


    print('status code from rook call: %d' % rservice_req.status_code)

    print('rservice_req text', rservice_req.text)

    try:
        json_info = rservice_req.json()
    except json.decoder.JSONDecodeError as ex_obj:
        user_msg = 'flask response is not JSON. Error: %s' % ex_obj
        return JsonResponse(get_json_error(user_msg))

    # current
    #
    #if app_name_in_url not in ['privateStatisticsapp']:
    #     return JsonResponse(json_info)

    # preferable, need UI to handle
    #
    user_resp = get_json_success('success',
                                 data=json_info)
    return JsonResponse(user_resp)


@login_required(login_url='login')
def download_from_volume(request, filepath):
    """Download from shared volume"""

    print('filepath', filepath)

    if not os.path.exists(filepath):
        return JsonResponse({'success': False, 'message': f'The requested file ({filepath}) was not found.'})

    with open(filepath, 'r') as file:
        return HttpResponse(file)
