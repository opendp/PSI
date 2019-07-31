# Docker Images in the PSI prototype

The prototype consists of 3 docker images, 2 of which are actually deployed:

1. [privacytoolsproject/psi-web](https://hub.docker.com/r/privacytoolsproject/psi-web/) - The webapp, currently Django
  - dockerfile: `Dockerfile-django`
1. [privacytoolsproject/psi-r-service](https://hub.docker.com/r/privacytoolsproject/psi-r-service/) - Flask service
  - dockerfile: `Dockerfile-r-service`

  - [privacytoolsproject/psi-r-service-base](https://hub.docker.com/r/privacytoolsproject/psi-r-service-base/tags/) - Base container for building the Flask service
    - dockerfile: `setup/flask/Dockerfile-r-base`
