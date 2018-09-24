import os
from os.path import isdir
from distutils.util import strtobool

from .base import *

DEBUG = strtobool(os.environ.get('DEBUG', 'False'))

SECRET_KEY = os.environ.get(\
                'SECRET_KEY',
                'overwrite-this-with-a-secret-from-the-env')

ALLOWED_HOSTS = ('*',) #('.psiprivacy.org', )

# Use host forwarded from nginx
#
USE_X_FORWARDED_HOST = True

# directed through nginx
#
ROOK_SVC_URL = os.environ.get(ROOK_SVC_URL, '/rook-custom/')

# -----------------------------------
# initial setup before external sql db
# -----------------------------------
LOCAL_SETUP_DIR = os.environ.get(\
                        'LOCAL_SETUP_DIR',
                        join(BASE_DIR, 'test_setup_local'))
if not isdir(LOCAL_SETUP_DIR):
    os.makedirs(LOCAL_SETUP_DIR)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(LOCAL_SETUP_DIR, 'psi_database.db3'),
    }
}

# -----------------------------------
# staticfiles served via nginx
# -----------------------------------
STATIC_ROOT = join('/psi_volume', 'staticfiles', 'static')
if not os.path.isdir(STATIC_ROOT):
    os.makedirs(STATIC_ROOT)

SESSION_COOKIE_NAME = os.environ.get('PSI_SESSION_COOKIE_NAME',
                                     'psiprivacy_gce')

CSRF_COOKIE_NAME = 'psiprivacy_gce_csrf'

PAGE_CACHE_TIME = 60 * 60 * 2 # 2 hours 
