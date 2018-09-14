from os.path import isfile
from psi_apps.utils.json_helper import json_loads
from psi_apps.utils.basic_response import \
    (ok_resp, err_resp)

def load_file_contents(fpath):
    """Given a file path, open the file and return the contents"""
    if not isfile(fpath):
        user_msg = 'File not found: %s' % fpath
        return err_resp(user_msg)

    fcontents = None
    try:
        with open(fpath, 'rb') as fh:
            fcontents = fh.read()
    except IOError as ex_obj:
        user_msg = 'Could not read file: %s\nError: %s' % (fpath, ex_obj)
        return err_resp(user_msg)

    return ok_resp(fcontents)


def load_file_as_json(fpath):
    """Given a file path, open the file and convert it to an OrderedDict"""
    if not isfile(fpath):
        user_msg = 'File not found: %s' % fpath
        return err_resp(user_msg)

    fcontents = None
    try:
        with open(fpath, 'r') as fh:
            fcontents = fh.read()
    except IOError as ex_obj:
        user_msg = 'Could not read file: %s\nError: %s' % (fpath, ex_obj)
        return err_resp(user_msg)

    json_info = json_loads(fcontents)
    if not json_info.success:
        return err_resp(json_info.err_msg)

    return ok_resp(json_info.result_obj)
