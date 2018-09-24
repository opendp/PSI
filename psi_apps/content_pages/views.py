from os.path import join, normpath, split

# from django.conf import settings
from django.conf import settings
from django.urls import reverse
from django.views.decorators.cache import cache_page
from django.http import HttpResponseRedirect, HttpResponse, Http404, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from psi_apps.utils.file_helper import load_file_as_json, load_file_contents
from psi_apps.utils.view_helper import \
    (get_json_error, get_json_success)


def interface(request):
    """Return the interface.html template"""
    info_dict = dict(ROOK_SVC_URL=settings.ROOK_SVC_URL,
                     CONTENT_PAGES_BASE_URL=reverse('viewContentPageBase'))


    return render(request,
                  'interface.html',
                  info_dict)


@cache_page(settings.PAGE_CACHE_TIME)
def view_content_page(request, page_name='psiIntroduction.html'):
    """Render a template from this project "/templates/content/(page_name)" directory"""
    template_name = normpath(join('content', page_name))

    # sanity check, and
    #
    path_parts = split(template_name)
    if not len(path_parts) == 2 and \
        path_parts[0] == 'content' and \
        path_parts[1] == page_name:
        raise Http404('content page not found: %s' % page_name)

    return render(request,
                  template_name)

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
