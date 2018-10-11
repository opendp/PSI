# Transform App

This directory contains a Haskell executable copied out of a Docker container
and is used within the rook docker container.


## How the binary was built

This binary was built through the following commands:

```
# (1) Using this repository, build a Docker image containing the Haskell executable
#
cd PSI # top of repository
docker build -t transformer_image -f Dockerfile-transformer .

# (2) Run the docker image
#
#  Note: within the container, an "ls" should show the file "transformer-exe"
#
docker run --rm --name transformer_run -it transformer_image /bin/bash


# (3) In a NEW Terminal, copy the executable out of the running docker image
#
#   This example copies "transformer-exe" to /tmp/transformer-exe
#   on the local machine
#
docker cp transformer_run:/app/transformer-exe /tmp/transformer-exe

# (4) Copy the update image into this repository
#
# Example:  > cp /tmp/transformer-exe PSI/rook/transformer_app

```



## Test the binary within the rook container

- Build the rook container
    ```
    # build it
    docker build -t rook_image -f Dockerfile-r-service .
    ```

- Run a test in R

    ```
    # Run the container
    #
    docker run --rm -it --name tapp rook_image /bin/bash

    #
    # Open R
    #
    cd /var/webapps/PSI/rook/transformer_app
    R

    # Test it out
    #
    source("transform_test.R")

    # formula
    #
    f2 <- "dbl_income = income * 2"

    # dataframe
    df = read.csv("test_input/test_data.csv")

    # transform method
    #
    applyTransform(f2, df)

    #
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
