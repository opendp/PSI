import os
import sys
from fabric import Connection, task
import django

# ----------------------------------------------------
# Add this directory to the python system path
# ----------------------------------------------------
FAB_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(FAB_BASE_DIR)

# ----------------------------------------------------
# Set the DJANGO_SETTINGS_MODULE, if it's not already
# ----------------------------------------------------
KEY_DJANGO_SETTINGS_MODULE = 'DJANGO_SETTINGS_MODULE'
if not KEY_DJANGO_SETTINGS_MODULE in os.environ:
    if FAB_BASE_DIR == '/var/webapps/PSI':
        os.environ.setdefault(KEY_DJANGO_SETTINGS_MODULE,
                              'psiproject.settings.production')
    else:
        os.environ.setdefault(KEY_DJANGO_SETTINGS_MODULE,
                              'psiproject.settings.local')

# ----------------------------------------------------
# Django setup
# ----------------------------------------------------
try:
    django.setup()
except Exception as e:
    print("WARNING: Can't configure Django. %s" % e)


def run_local_cmd(desc, cmd):
    """Run a command on the host"""
    print('-' * 40)
    print(desc)
    print(cmd)
    print('-' * 40)
    conn = Connection('host')
    conn.local(cmd)

@task
def run_rook(context):
    """Run the rook server via the command line"""
    cmd = 'cd rook; Rscript rook_nonstop.R'

    run_local_cmd(run_rook.__doc__, cmd)
