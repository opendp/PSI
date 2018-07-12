# Grapher_coeff.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

##
# Takes the results files from the output of Test_simul.R and can
# plot different statistics based on results.
##

TRUE_BETA <- seq(from=-1000, to=1000, by=10)

means <- NULL
for (coeff in TRUE_BETA) {

fileName <- paste("./simul_results/coeff=", coeff, ".txt", sep="")
theFile <- read.csv(file = fileName, sep = ",")

means <- append(means, quantile(abs(coeff - theFile[, 2]), 0.67))
}		 

#plot(iterate_n, spec, main = "Spectral Norm vs. n", xlab="n", ylab="mean(Spectral Norm (error))")
plot(TRUE_BETA, means, main = "70% Quantile of OLS Estimator While Changing Coefficient", xlab="True Beta 2", ylab="70% OLS Estimator")