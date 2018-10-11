# Transform App

This directory contains a Haskell executable copied out of a Docker container
that is used within the rook docker container.


## How the binary was built

This binary was built through the following commands:

```
# (1) Using this repository, build a Docker image containing the Haskell executable
#   (This can take a few minutes)
#
cd PSI # top of repository
docker build -t transformer_image -f Dockerfile-transformer .


# (2) Test the docker image.
#   The output should be as follows:
#     Run the executable...
#     Error: Input is blank...
#
docker run --rm --name transformer_run transformer_image


# (3) Run the docker image
#
#  Note: within the container, an "ls" should show the file "transformer-exe"
#
docker run --rm --name transformer_run -it transformer_image /bin/bash


# (4) In a NEW Terminal, copy the executable out of the running docker image
#
#   This example copies "transformer-exe" to /tmp/transformer-exe
#   on the local machine
#
docker cp transformer_run:/app/transformer-exe /tmp/transformer-exe


# (5) Copy the updated executable into the PSI repository
#   where it will be deployed with rook
#
# Example:  > cp /tmp/transformer-exe PSI/rook/transformer_app/transformer-exe

```



## Test the binary within the rook container

```
#
# (1) Build the rook container
#
docker build -t rook_image -f Dockerfile-r-service .

#
# (2) Run the image with a bash terminal
#
docker run --rm -it --name tapp rook_image /bin/bash

#
# Run a test in R
#
cd /var/webapps/PSI/rook/transformer_app
R

# Load R functions
#
source("transform_test.R")

# create a formula
#
f2 <- "dbl_income = income * 2"

# make a dataframe
df = read.csv("test_input/test_data.csv")

# transform method which calls the executable
#
applyTransform(f2, df)

```


- Postman

```
http://0.0.0.0:8000/custom/verifyTransformapp

{"formula":"a2 <- age*age","names":["age","sex","educ","race","income","married"]}

```

```
import json
import requests
import urllib.parse
v = '{"formula":"sq_income <- income*income","names":["age","income"]}'
data_payload = {'tableJSON':v}
rook_svc_url = 'http://0.0.0.0:8000/custom/verifyTransformapp'
r = requests.post(rook_svc_url, data=data_payload)
r.status_code
r.text
```
