#!/bin/bash

cd ~/PSI/PSI/
. `which virtualenvwrapper.sh`
workon psi


PORT_DJANGO=${1:-"8081"}
PORT_FLASK=${1:-"8001"}

export FLASK_SERVER_BASE="http://0.0.0.0:${PORT_FLASK}/"

gnome-terminal --tab -- /bin/bash -c "echo -ne '\033]0;flask\007'; fuser -k $PORT_FLASK/tcp; fab run-flask --port=$PORT_FLASK"
gnome-terminal --tab -- /bin/bash -c "echo -ne '\033]0;django\007'; fuser -k $PORT_DJANGO/tcp; fab run-web --port=$PORT_DJANGO"
