# Transform App

This directory contains a Haskell executable copied out of a Docker container
and used within the rook docker container.


## How the binary was built




## Test the binary within the rook container

- build the container

```
# build it
docker build -t transformer_test -f Dockerfile-r-service .
```

- Test the container

```
# Run the container and go to its terminal
#
docker run --rm -it --name tapp transformer_test /bin/bash

# Open R
#
cd transformer_app
R

# Test it out
#
source("transform_test.R")

# formula
f2 <- "dbl_income = income * 2"

# dataframe
df = read.csv("/var/webapps/PSI/rook/transformer_app/test_input/test_data.csv")

# transform method
#
applyTransform(f2, df)
```
