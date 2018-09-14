from .base import *
from os import makedirs
from os.path import isdir

LOCAL_SETUP_DIR = os.environ.get(\
                        'LOCAL_SETUP_DIR',
                        join(BASE_DIR, 'test_setup_local'))
if not isdir(LOCAL_SETUP_DIR):
    makedirs(LOCAL_SETUP_DIR)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'i9m7!1oij3-yx8o0xq09j4ow_^t2hazhyt#t@r^kr6n1ad3!*t'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(LOCAL_SETUP_DIR, 'psi_database.db3'),
    }
}

# where static files are collected
STATIC_ROOT = join(LOCAL_SETUP_DIR, 'staticfiles')
if not isdir(STATIC_ROOT):
    makedirs(STATIC_ROOT)

TEST_DIRECT_STATIC = join(BASE_DIR, 'assets')

MEDIA_ROOT = join(LOCAL_SETUP_DIR, "media")

MEDIA_URL = '/media/'
