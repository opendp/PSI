"""Convenience methods for JSON strings"""
import json
from collections import OrderedDict

#from django.utils.safestring import mark_safe
from psi_apps.utils.psi_json_encoder import PSIJSONEncoder
from psi_apps.utils.basic_response import \
    (ok_resp, err_resp)

def json_loads(json_str):
    """wrapper for json.loads with OrderedDict"""
    try:
        json_dict = json.loads(json_str,
                               object_pairs_hook=OrderedDict)
    except json.decoder.JSONDecodeError as err_obj:
        err_msg = 'Failed to convert string to JSON: %s' % (err_obj)
        return err_resp(err_msg)
    except TypeError as err_obj:
        err_msg = 'Failed to convert string to JSON: %s' % (err_obj)
        return err_resp(err_msg)

    return ok_resp(json_dict)


def json_dumps(data_dict, indent=None):
    """Dump JSON to a string w/o indents"""
    if indent is not None and \
        not isinstance(indent, int):
        # quick sanity check
        return err_resp('indent must be None or an integer')

    try:
        # dump it to a string
        jstring = json.dumps(data_dict,
                             indent=indent,
                             cls=PSIJSONEncoder)
        return ok_resp(jstring)

    except TypeError as err_obj:
        # uh oh
        user_msg = ('Failed to convert to JSON: %s'
                    ' (json_util)\n\n%s') % \
                    (err_obj, str(data_dict)[:200])
        return err_resp(user_msg)


def format_pretty_from_dict(info_dict, indent=4):
    """Load a string into JSON"""
    return json_dumps(info_dict, indent)
    #try:
    #    return ok_resp(json.dumps(info_dict, indent=indent))
    #except TypeError as ex_obj:
    #    return err_resp('(Invalid JSON) %s' % ex_obj)


def format_pretty(json_string, indent=4):
    """Load a string and return it as a formatted JSON string"""

    json_info = json_loads(json_string)
    if not json_info.success:
        return err_resp(json_info.err_msg)

    return json_dumps(json_info.result_obj, indent)


"""
def format_jsonfield_for_admin(json_dict, indent=4):

    if not json_dict:
        return 'n/a'

    d_pretty = '<pre>%s</pre>' % json.dumps(json_dict, indent=indent)

    return mark_safe(d_pretty)
"""
