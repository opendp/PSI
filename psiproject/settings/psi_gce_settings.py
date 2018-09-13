import os
from distutils.util import strtobool

from .base import *

DEBUG = strtobool(os.environ.get('DEBUG', 'False'))

SECRET_KEY = 'psix(*d87_-#a-na-change-th!s-for-prod_j6n@d&xi395h!6dwah'

ALLOWED_HOSTS = ('*',) #('.psiprivacy.org', )

# Use host forwarded from nginx
#
USE_X_FORWARDED_HOST = True


# -----------------------------------
# staticfiles served via nginx
# -----------------------------------
STATIC_ROOT = join('/psi_volume', 'staticfiles', 'static')
if not os.path.isdir(STATIC_ROOT):
    os.makedirs(STATIC_ROOT)

SESSION_COOKIE_NAME = os.environ.get('PSI_SESSION_COOKIE_NAME',
                                     'psiprivacy_gce')
CSRF_COOKIE_NAME = 'psiprivacy_gce_csrf'
