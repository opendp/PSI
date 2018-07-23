from .base import *

# SECRET_KEY = os.environ.get('SECRET_KEY')
SECRET_KEY = 'i9m7!1oij3-yx8o0xq09j4ow_^t2hazhyt#t@r^kr6n1ad3!*t'

MIDDLEWARE += ['django.middleware.csrf.CsrfViewMiddleware',]

DEBUG = False

ALLOWED_HOSTS = ['*']
