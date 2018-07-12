# Test_simple_d.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

##
# This runs a simple test on the Analyze Gauss algorithm while varying 
# the number of samples. Essentially we're testing accuracy as we increase
# n. 
#
# You should expect to see our variance and covariance approach the true
# values as n increases.
##

rm(list=ls())
setwd("~/Dropbox/School/differential privacy/privacy_tools/vcv/current/")
source("ComputeVCV.R")
source("Statistics.R")

# Set the various constants
EPSILON <- 1/10
DELTA <- 2^(-16)
d <- 4

# Create a sequence of n values
NSEQ <- seq(from = 1000, to=1000000, by=10000)

# Set the number of experiments
EXP <- 100

# Create matrices to record results
spec <- matrix(0, nrow=length(NSEQ), ncol = EXP)
frob <- matrix(0, nrow=length(NSEQ), ncol = EXP)
covs <- matrix(0, nrow=length(NSEQ), ncol = EXP)
vars <- matrix(0, nrow=length(NSEQ), ncol = EXP)

# Loop through the different n values
# Note: We rengerate data each time
for (n in NSEQ) {
	
	#Generate Data
	rand_centers <- runif(d, 100, 10000)
	rand_sd <- runif(d, 0, 100)

	mydata <- matrix(0, n, d + 1)
	
	for (i in 1:d) {
		mydata[, i] <- rnorm(n, mean = rand_centers[i], sd=rand_sd[i])
	}
	
	# Generate linearly dependent column with noise added from a normal distribution
	noise <- rnorm(n, mean = 0, sd = 10)
	mydata[, d+1] <- (mydata[, 2] * 2) + as.matrix(noise)
	
	# Get statistics
	# NOTE: THIS IS NOT DP
	min <- getMins(mydata)
	max <- getMaxes(mydata)
	
	# Set L2 Bound (from Analyze Gauss)
	L2Bound <- sqrt(ncol(mydata))
	
	# Exp results
	spec_runs <- NULL
	F_runs <- NULL
	var1 <- NULL
	cov1 <- NULL
	
	# Repeat algorithm EXP times
	for (i in 1:EXP) {
		cat(i, "\n")
		release <- ComputeVCV(mydata, mean, min, max, EPSILON, DELTA, L2Bound)
		
		# Record the results
		spec_runs <- append(spec_runs, norm(actual - release, type = "2"))
		F_runs <- append(F_runs, norm(actual - release, type="F"))
		var1 <- append(var1, release[1,1])
		cov1 <- append(cov1, release[1,2])		
	}	 

	# Record results in a matrix
	spec[which(n==NSEQ), ]	<- spec_runs
	frob[which(n==NSEQ), ]	<- F_runs
	covs[which(n==NSEQ), ]	<- var1
	vars[which(n==NSEQ), ]	<- cov1
}