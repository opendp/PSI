
# (10) Copy test data to /psi_volume
#
printf "\n(10) Copy data to /psi_volume"
cp -r /var/webapps/PSI/data/. /psi_volume/data

printf "\n(20) Run collectstatic"
fab collect-static

# (50) "Run web server.."
printf "\n(30) Run web server.."
#setsid python manage.py runserver 0.0.0.0:8080
gunicorn --timeout 120 --workers 3 --bind 0.0.0.0:8080 psiproject.wsgi_psi_gce
