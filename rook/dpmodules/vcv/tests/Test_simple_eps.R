# Test_simple_eps.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

##
# This runs a simple test on the Analyze Gauss algorithm while varying 
# epsilon values. Essentially we're testing accuracy as we increase
# epsilon. 
#
# You should expect to see our variance and covariance approach the true
# values as epsilon increases.
##
rm(list=ls())
setwd("~/Dropbox/School/differential privacy/privacy_tools/vcv/current/")
source("ComputeVCV.R")
source("Statistics.R")

# Set constants for algorithm
EPSILON <- seq(from = 1/100, to=0.4, by = 1/200)
DELTA <- 2^(-16)
n <- 50000
d <- 4

# Set the number of experiments
EXP <- 100

# Create an empty matrix to store results in
spec <- matrix(0, nrow=length(EPSILON), ncol = exp)
frob <- matrix(0, nrow=length(EPSILON), ncol = exp)
covs <- matrix(0, nrow=length(EPSILON), ncol = exp)
vars <- matrix(0, nrow=length(EPSILON), ncol = exp)


# Main loop (runs through all of the different values of epsilon)
# Note: we regenerate the data for each run of epsilon
for (exp_eps in EPSILON) {
	
	#Generate Data
	rand_center <- runif(d, 100, 10000)
	rand_spread <- runif(d, 0, 100)
	mydata <- matrix(0, n, d + 1)
	
	# Generate each column of data from a normal distribution with random mean
	# and random sd.
	for (i in 1:d) {
		mydata[, i] <- rnorm(n, mean = rand_center[i], sd=rand_spread[i])
	}
	
	# Generate linearly dependent columns (with noise from a normal distribution)
    # In this case, we create new column (d+1 th) from column 2.
	noise <- rnorm(n, mean = 0, sd = 10)
	mydata[, d+1] <- (mydata[, 2] * 2) + as.matrix(noise)
		
	# Get min and max statistics
	# NOTE: WE CURRENTLY DO THIS IN A NON-DP MANNER
	min <- getMins(mydata)
	max <- getMaxes(mydata)
	
	# Set usual L2 Bound
	L2Bound <- sqrt(ncol(mydata))
	
	# Record runs
	spec_runs <- NULL
	F_runs <- NULL
	var1 <- NULL
	cov1 <- NULL
	
	# Run the data through the algorithm EXP times.
	for (i in 1:EXP) {
		cat(i, "\n")
		release <- ComputeVCV(mydata, mean, min, max, exp_eps, DELTA, L2Bound)
		
		# Record Spectral and Frobenius norms of error matrix
		spec_runs <- append(spec_runs, norm(actual - release, type = "2"))
		F_runs <- append(F_runs, norm(actual - release, type="F"))
		
		# Record variance of column 1 and cov(col 1 and col 2)
		var1 <- append(var1, release[1,1])
		cov1 <- append(cov1, release[1,2])		
	}	 
		
	# Add runs to results matrix
	spec[which(exp_eps==EPSILON), ]	<- spec_runs
	frob[which(exp_eps==EPSILON), ]	<- F_runs
	covs[which(exp_eps==EPSILON), ]	<- cov1
	vars[which(exp_eps==EPSILON), ]	<- var1
}