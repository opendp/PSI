import os
import sys
from fabric import task
from invoke import run as fab_local
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


def run_local_cmd(cmd, description=None):
    """Run a command on the host"""
    print('-' * 40)
    if description:
        print(description)
    print(cmd)
    print('-' * 40)
    fab_local(cmd)

@task
def run_rook(context):
    """Run the rook server via the command line"""
    cmd = 'cd rook; Rscript rook_nonstop.R'

    run_local_cmd(cmd, run_rook.__doc__)

# @task
# def create_django_superuser():
#     """(Test only) Create superuser with username: dev_admin. Password is printed to the console."""
#     User.objects.create_superuser('admin', '', 'admin')


@task
def collect_static(context):
    """Run the Django collectstatic command"""
    local('python manage.py collectstatic --noinput')


@task
def init_db(context):
    """Initialize the django database--if needed"""
    cmd = ('python manage.py check;'
           'python manage.py migrate')
    run_local_cmd(cmd, init_db.__doc__)

@task
def run_web(context):
    """Run the django web app"""
    init_db(context)

    cmd = ('python manage.py createsuperuser;'
           'python manage.py runserver 8080')

    run_local_cmd(cmd, run_web.__doc__)
