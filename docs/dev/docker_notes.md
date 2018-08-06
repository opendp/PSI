# Docker Images in the PSI prototype

The prototype consists of 3 docker images, 2 of which are actually deployed:

1. [tworavens/psi-web](https://hub.docker.com/r/tworavens/psi-web/) - The webapp, currently Django
  - dockerfile: `Dockerfile-django`
1. [tworavens/psi-r-service](https://hub.docker.com/r/tworavens/psi-r-service/) - Rook service
  - dockerfile: `Dockerfile-r-service`

  - [tworavens/psi-r-service-base](https://hub.docker.com/r/tworavens/psi-r-service-base/tags/) - Base container for building the rook service
    - dockerfile: `setup/rook/Dockerfile-r-base`
