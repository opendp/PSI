# Note: This only runs the Django app, not the rook services
FROM python:3.5.2
MAINTAINER Raman Prasad (raman_prasad@harvard.edu)

LABEL organization="PSI" \
      2ra.vn.version="0.0.6-beta" \
      2ra.vn.release-date="2018-01-11" \
      description="Image for the PSI python service which serves the UI."

# -------------------------------------
# Install sqlite + debugging tools
# -------------------------------------
RUN apt-get update && \
    apt-get install -y apt-utils \
    apt-utils \
    iputils-ping \
    telnet \
    vim 


# -------------------------------------
# Set the workdir
# -------------------------------------
WORKDIR /var/webapps/PSI

# -------------------------------------
# Copy over the requirements and run them
# -------------------------------------
COPY ./requirements/ ./requirements
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir -r requirements/base.txt


# -------------------------------------
# Copy over the rest of the repository
# -------------------------------------
COPY . .

# -------------------------------------
# Set some environment variables
#   (This can be overridden in docker compose/kubernetes)
#
# - DJANGO_SETTINGS_MODULE: Django settings
# - ROOK_SERVER - rook-service docker container
# - CODE_REPOSITORY - repository where code will be copied
# -------------------------------------
ENV DJANGO_SETTINGS_MODULE=psiproject.settings.local \
    ROOK_SERVER='http://0.0.0.0:8000/custom/' \
    CODE_REPOSITORY=/var/webapps/PSI \
    LC_ALL=C.UTF-8

# -------------------------------------
# Create a volume for sharing between containers
# -------------------------------------
VOLUME /psi_volume

# -------------------------------------
# Run setup scripts
#   - init_db - creates sqlite db for test run with
#
#   - create_django_superuser - Admin user created for testing
#
#   - create_test_user - Non-admin user created for testing
#
#   - load_docker_ui_config - sets JS variables for UI d3m_mode to true
#
#   - collect_static - django collect static files
#
#   - make_d3m_config_files - makes test config files accessible via env variables
#                             (not used for eval)
#   - make_d3m_config - WARNING: for testing. Loads D3M info based on the test data
#
# -------------------------------------
RUN fab init-db
#ENV DJANGO_DB_NAME=default
#ENV DJANGO_SU_NAME=admin
#ENV DJANGO_SU_EMAIL=admin@my.company
#ENV DJANGO_SU_PASSWORD=mypass

# RUN python -c "import django; django.setup(); \
#   from django.contrib.auth.management.commands.createsuperuser import get_user_model; \
#   get_user_model()._default_manager.db_manager('$DJANGO_DB_NAME').create_superuser( \
#   username='$DJANGO_SU_NAME', \
#   email='$DJANGO_SU_EMAIL', \
#   password='$DJANGO_SU_PASSWORD')"

# -------------------------------------
# Expose port for web communication
# - web: 8080
# -------------------------------------
EXPOSE 8080

#RUN cd /var/webapps/PSI && \
#    printf "\nStarting web server.." && \
#    fab run-web

CMD ["python3", "manage.py", "migrate"]
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8080"]

#RUN ls
#RUN python --version
#RUN python manage.py migrate
#RUN python manage.py runserver 8080
#CMD ["python manage.py runserver 8080"]

# COPY startup script into known file location in container
#COPY start.sh /start.sh


# CMD specifcies the command to execute to start the server running.
# CMD ["/start.sh"]
# done!