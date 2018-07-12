# Test_simul.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

##
# This runs a simple test on the Analyze Gauss algorithm with
# simulated data that is linearly related. In this test, we maniuplate
# the coefficient of the linear relation from -100 to 100.
##

rm(list=ls())
setwd("~/Dropbox/School/differential privacy/privacy_tools/vcv/current/")
source("ComputeVCV.R")
source("Statistics.R")

# Set constants
EPSILON <- 1/10
DELTA <- 2^(-16)
n <- 50000
d <- 5

# Set number of experiments to run
EXP <- 200

# Create a sequence of True Beta values
TRUE_BETA <- seq(from=-100, to=100, by=5)

# Repeat over our sequence of betas 
for (coeff in TRUE_BETA) {
	
	#Generate Data
	rand_center <- runif(d, 100, 10000)
	rand_sd <- runif(d, 0, 100)
	
	# empty matrix for data
	mydata <- matrix(0, n, d + 1)
	
	# generate random columns
	for (i in 2:d) {
		mydata[, i] <- rnorm(n, mean = rand_center[i], sd = rand_sd[i])
	}
	
	# Generate a linearly related column
	noise <- rnorm(n, mean = 0, sd = 1)
	mydata[, d+1] <- (mydata[, 2] * coeff) + as.matrix(noise)
	
	# This is just a names fix
	colnames(mydata)[d + 1] <- d + 1
	
	# Prepend the data with 1s for intercept calculation
	mydata[ , 1] <- 1
	
	# Find the actual LM estimations
	LM_BETA <- summary(lm(mydata[, d+1] ~ mydata[,2] + mydata[,3]))$coefficients[,1]
	
	# Get necessary statistics
	# NOTE: THIS IS NOT DP
	min <- getMins(mydata)
	max <- getMaxes(mydata)
	
	# Set the L2 bound according to Analyze Gauss
	L2Bound <- sqrt(ncol(mydata))
	
	# Setup experiment recording
	Beta_runs <- NULL
	
	beta1_runs <- NULL
	beta2_runs <- NULL
	beta3_runs <- NULL
	
	stderr1_runs <- NULL
	stderr2_runs <- NULL
	stderr3_runs <- NULL
	
	t1_runs <- NULL
	t2_runs <- NULL 
	t3_runs <- NULL
	
	Pr1_runs <- NULL
	Pr2_runs <- NULL
	Pr3_runs <- NULL

	spec_runs <- NULL
	minE_runs <- NULL
	
	S_runs <- NULL
	
	cat("TRUE: ",coeff, "\n")
	# Repeat experiment EXP times
	for (i in 1:EXP) {
		cat(i, "\n")
		
		# Run the algorithm
		release <- ComputeVCV(mydata, mean, min, max, EPSILON, DELTA, L2Bound)
			
		# Names fix
		colnames(release)[1:d] <- 1:d
		rownames(release)[1:d] <- 1:d
		colnames(actual)[1:d] <- 1:d
		colnames(actual)[1:d] <- 1:d
			
		# Select regression variables
		X <- c(1, 2, 3)
		Y <- d + 1
		
	 	source("Regression.R")
	 	
	 	# Record results
		beta1_runs <- append(beta1_runs, beta[1, 1])
		beta2_runs <- append(beta2_runs, beta[2, 1])
		beta3_runs <- append(beta3_runs, beta[3, 1])
	
		stderr1_runs <- append(stderr1_runs, stderror[1, 1])
		stderr2_runs <- append(stderr2_runs, stderror[2, 1])
		stderr3_runs <- append(stderr3_runs, stderror[3, 1])
		
		t1_runs <- append(t1_runs, t[1, 1])
		t2_runs <- append(t2_runs, t[2, 1])
		t3_runs <- append(t3_runs, t[3, 1])
	
		Pr1_runs <- append(Pr1_runs, Pr[1, 1])
		Pr2_runs <- append(Pr2_runs, Pr[2, 1])
		Pr3_runs <- append(Pr3_runs, Pr[3, 1])
	
		S_runs <- append(S_runs, S)
	
		Beta_runs <- append(Beta_runs, norm(LM_BETA - beta, type = "2"))
	  }
	
	  # Write results for each different coeff value in a txt file
	  fileName <- paste("./simul_results/coeff=", coeff, ".txt", sep="")
	  df <- data.frame(beta1_runs, beta2_runs, beta3_runs,
					 stderr1_runs, stderr2_runs, stderr3_runs,
					 t1_runs, t2_runs, t3_runs,
					 Pr1_runs, Pr2_runs, Pr3_runs,
					 S_runs, Beta_runs)
					 
	  write.table(df, file = fileName, row.names = FALSE, sep = ", ")
}