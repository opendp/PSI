# Test_PUMS.R 
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

rm(list=ls())
setwd("~/Dropbox/School/differential privacy/privacy_tools/vcv/current/")
source("ComputeVCV.R")
source("Statistics.R")

EPSILON <- 1/100
DELTA <- 2^(-16)

# Number of experiments to run
EXP <- 1000

# Tracker variables
beta_dist_runs <- NULL
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
S_runs <- NULL

# Load PUMS
load("../../data/PUMS5extract.Rdata")

# Remove unneeded data
mydata$X <- NULL
mydata$state <- NULL
mydata$puma <- NULL
mydata$sex <- NULL
mydata$latino <- NULL
mydata$black <- NULL
mydata$asian <- NULL
mydata$married <- NULL

# Prepend 1s to data in order to calculate intercept
mydata <- cbind(1, mydata)

# Get mins and maxes
min <- getMins(mydata)
max <- getMaxes(mydata)

# Set L2 Bound for algorithm (based off 'Analyze Guass')
L2Bound <- sqrt(ncol(mydata))

# Use lm() to get "true" intercept results
true_beta <- summary(lm(mydata[,4] ~ mydata[,2] + mydata[,3]))$coefficients[,1]

# Enter main experiment loop
for (i in 1:EXP) {
	cat(i, "\n")
	release <- ComputeVCV(mydata, mean, min, max, EPSILON, DELTA, L2Bound)
			
	# Set regression variables 			
	X <- c(1, 2, 3)
	Y <- 4
	
	# Run the regression
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
	
	beta_dist_runs <- append(beta_dist_runs, norm(true_beta[2:3] - beta[2:3], type="2"))
}