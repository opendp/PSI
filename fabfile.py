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
def run_flask(context, port=8000):
    """Run the flask server via the command line"""
    cmd = f'cd R; python3 runner.py {port}'
    os.environ['FLASK_SERVER_BASE'] = f'http://0.0.0.0:{port}/'
    run_local_cmd(cmd, run_flask.__doc__)

# @task
# def create_django_superuser():
#     """(Test only) Create superuser with username: dev_admin. Password is printed to the console."""
#     User.objects.create_superuser('admin', '', 'admin')


@task
def collect_static(context):
    """Run the Django collectstatic command"""
    fab_local('python manage.py collectstatic --noinput')


@task
def init_db(context):
    """Initialize the django database--if needed"""
    cmd = ('python manage.py check;'
           'python manage.py migrate')
    print("about to run init_db")
    run_local_cmd(cmd, init_db.__doc__)

    create_test_user(context)
    create_superuser(context)


@task
def run_web(context, port=8080):
    """Run the django web app"""
    init_db(context)
    print("Run web server")
    cmd = (f'python manage.py runserver {port}')

    run_local_cmd(cmd, run_web.__doc__)


@task
def create_superuser_random_pw(context):
    create_superuser(context, random_pw=True)


@task
def create_superuser(context, random_pw=False):
    """(Test only) Create superuser with username: dev_admin. Password is printed to the console."""
    from psi_apps.psi_auth.models import CustomUser

    dev_admin_username = 'dev_admin'

    #User.objects.filter(username=dev_admin_username).delete()
    if CustomUser.objects.filter(username=dev_admin_username).count() > 0:
        print('Superuser "%s" already exists' % dev_admin_username)
        return

    if random_pw:
        import random, string
        admin_pw = ''.join(random.choice(string.ascii_lowercase + string.digits)
                           for _ in range(7))
    else:
        admin_pw = 'admin'

    new_user = CustomUser(username=dev_admin_username,
                          first_name='Dev',
                          last_name='Administrator',
                          email='',
                          is_staff=True,
                          is_active=True,
                          is_superuser=True)
    new_user.set_password(admin_pw)
    new_user.save()

    print('superuser created: "%s"' % dev_admin_username)
    print('password: "%s"' % admin_pw)




@task
def create_test_user(context):
    """(Test only) Create a test user with credentials: test_user/test_user"""
    from psi_apps.psi_auth.models import CustomUser
    import random

    test_username = 'test'
    password = 'adminadmin'

    #User.objects.filter(username=dev_admin_username).delete()
    if CustomUser.objects.filter(username=test_username).count() > 0:
        print('User "%s" already exists' % test_username)
        return

    new_user = CustomUser(username=test_username,
                          first_name='Ye Test',
                          last_name='User',
                          email='',
                          is_staff=True,
                          is_active=True,
                          is_superuser=False)
    new_user.set_password(password)
    new_user.save()

    print('test user created: "%s"' % test_username)
    print('password: "%s"' % password)
