import rpy2.robjects as robjects
import json
import os
import sys

import flask
from multiprocessing import Pool

NUM_PROCESSES = 1

TIMEOUT_MAX = 60 * 5
TIMEOUT_DEFAULT = 60 * 2

KEY_SUCCESS = 'success'
KEY_DATA = 'data'

flask_app = flask.Flask(__name__)

production = os.getenv('FLASK_USE_PRODUCTION_MODE', 'no') == 'yes'
flask_app.debug = not production


# multiprocessing.Process is buffered, stdout must be flushed manually
def debug(*values):
    print(*values)
    sys.stdout.flush()


def task_handler(task):
    robjects.r.source("config.R")
    robjects.r.source('setup.R')

    dp_modules_utilities = [
        "DPUtilities.R",
        "GetFunctionsWithPSIlenceHardCode.R",
        "update_parameters.R",
        "Calculate_stats.R",
        "CompositionTheorems.R",
        "ReadJSON.R",
        "CreateXML.R",
        "transform.R",
        "cem-utilities.R",
        "dpATT.R",
        "dpCEM.R",
        "CEM_getFunctions.R",
    ]

    for utility in dp_modules_utilities:
        robjects.r.source('dpmodules/Jack/' + utility)

    for app in os.listdir('apps/'):
        if app.endswith('.R'):
            robjects.r.source(f'apps/{app}')

    data_casted = r_cast(task['data'])

    debug(task)

    # R returns a singleton list of a json string
    return robjects.globalenv[task['app']](data_casted)[0]


@flask_app.route('/<r_app>', methods=['POST'])
def app_general(r_app):

    data = flask.request.json

    # sanity check timeout
    if isinstance(data.get('timeout', None), (int, float)):
        timeout = min(max(data.get('timeout'), 0), TIMEOUT_MAX)
    else:
        timeout = TIMEOUT_DEFAULT

    data['timeout'] = timeout

    handler = pool.apply_async(task_handler, [{
        'app': r_app,
        'data': data
    }])

    try:
        resp = flask.Response(handler.get(timeout=timeout))
        resp.headers['Content-Type'] = 'application/json'
        return resp
    except TimeoutError:
        return json.dumps({KEY_SUCCESS: False, KEY_DATA: 'Timeout exceeded'})


# convert nested python objects to nested R objects
def r_cast(content):
    robjects.r.library('jsonlite')
    return robjects.r['fromJSON'](json.dumps(content))


# convert nested R objects to nested python objects
def python_cast(content):
    return json.loads(robjects.r['toJSON'](content)[0])


if __name__ == '__main__':
    pool = Pool(processes=NUM_PROCESSES)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    try:
        flask_app.run(port=port, threaded=True)
    except KeyboardInterrupt:
        pool.close()
        pool.join()


# ~~~~~ USAGE ~~~~~~

# # call preprocess app (call the rookPreprocess function in the global R environment)
# print(call_r_app('rookPreprocess', {
#     'data': '/ravens_volume/test_data/185_baseball/TRAIN/dataset_TRAIN/tables/learningData.csv',
#     'datastub': '185_baseball'
# }))
#
#
# # call solver app
# print(call_r_app('rookSolver', {
#     'dataset_path': '/ravens_volume/test_data/185_baseball/TRAIN/dataset_TRAIN/tables/learningData.csv',
#     'problem': {
#         "targets": ["Doubles", "RBIs"],
#         "predictors": ["At_bats", "Triples"],
#         "task": "regression"
#     },
#     'method': 'lm'
# }))
