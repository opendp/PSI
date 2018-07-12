This folder contains all of the code related to releasing a differentially private variance-covariance matrix.

All files for testing the DP-algorithm for releasing the VCV matrix are located in the "tests" folder. Please note, in order to run these files on your own computer, you will have to reset the working directory as well as reference the necessary dependencies.

ComputeVCV.R -> This file contains the algorithm to release a differentially private VCV matrix. It has no dependencies.

-----
In order to perform a regression, we require the following files:

Regression.R -> Code to perform a linear regression.
	Before running Regression.R you need several variables in your environment. Please see the source for more details.

FixDTD.R -> Code to make a singular VCV matrix invertible. This gets called by Regression.R
Statistics.R -> Code to compute non-DP statistics for testing purposes.
-----

If you'd like to run a test, I recommend the Test_PUMS.R file. Note its dependency on the PUMS data. This willrelease a VCV matrix for 3 PUMS variables and then compute a linear regression off of those 3 variables.

Connor Bain
bainco@email.sc.edu
(803) 728-7859
