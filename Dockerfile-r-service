FROM tworavens/psi-r-service-base:latest
MAINTAINER Raman Prasad (raman_prasad@harvard.edu)

LABEL organization="PSI" \
      2ra.vn.version="0.0.6-beta" \
      2ra.vn.release-date="2018-01-11" \
      description="Image for the PSI R service, which runs on rook."

# -------------------------------------
# Install R openssl library
# -------------------------------------
#RUN R -e 'install.packages("openssl", repos="http://cran.rstudio.org")'
RUN R -e 'library(devtools);install_github("privacytoolsproject/PSI-Library")'

# -------------------------------------
# Install Tex Base
# -------------------------------------
RUN apt-get update && \
    apt-get install -y pandoc \
    texlive-full

RUN tlmgr init-usertree

# -------------------------------------
# Copy the repo over
#   - future: ignore the tworavens django dirs
#     and assets, be more selective
# -------------------------------------
RUN mkdir -p /var/webapps/PSI && \
    mkdir -p /var/webapps/PSI/assets && \
    mkdir -p /var/webapps/PSI/data && \
    mkdir -p /psi_volume

# Copy over the repository
COPY ./rook/ /var/webapps/PSI/rook
COPY ./LICENSE /var/webapps/PSI
COPY ./README.md /var/webapps/PSI
COPY ./data/ /var/webapps/PSI/data


# -------------------------------------
# Create a volume for outside info
# -------------------------------------
VOLUME /psi_volume

# -------------------------------------
# Expose port for the web (rook)
# -------------------------------------
EXPOSE 8000

WORKDIR /var/webapps/PSI/rook

# -------------------------------------
# Run django with "rook_nonstop.R"
# -------------------------------------
CMD Rscript rook_nonstop.R

# -----------------------------------------
# -- Dev notes --
#
# build local:
# >docker build -t rook1 -f ./Dockerfile-r-service .
#
# shell access:
# >docker run -ti  -p 8000:8000 rook1 /usr/bin/bash
#
# run app
# >docker run -p 8000:8000 rook1
# go to: http://0.0.0.0:8000/subsetapp
# -----------------------------------------
