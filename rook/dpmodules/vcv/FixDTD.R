# FixDTD.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

##
# File to 'fix' the 2nd moment matrix. Really what we're doing
# here is changing any negative (or close to negative) eigen values
# of our released 2nd moment matrix to the least positive value.
#
# SOURCE: Mixture of Gaussian Models and Bayes Error under DP [Xi, Kantarcioglu, Inan]
#
##

save_DTD <- DTD

Y_col <- append(Y.DTD, Y.Y)

test <- rbind(DTD, 0)
test <- cbind(test, 0)

test[nrow(test), ] <- t(as.matrix(Y_col))
test[, ncol(test)] <- as.matrix(Y_col)

names <- names(save_DTD)

# EIGEN VALUE DECOMPOSITION
eigen_values <- eigen(test)$values
if(min(eigen_values) < 0) {
	DTD <- test
	
	sorted <- sort(eigen_values, decreasing=FALSE)
	j <- 1
	while(sorted[j] < 0) {
		
		j <- j + 1
	}
	
	for (i in 1:length(eigen_values)) {
		if(eigen_values[i] < 0) {
			cat("shift\n")
			eigen_values[i] <- sorted[j]
		} 
	}
	
DTD <- eigen(test)$vectors %*% diag(eigen_values) %*% t(eigen(test)$vectors)
colnames(DTD) <- names
rownames(DTD) <- names

Y.DTD <- DTD[-(nrow(DTD)), ncol(DTD)]
Y.Y <- DTD[nrow(DTD), ncol(DTD)]

DTD <- DTD[-(nrow(DTD)), -(ncol(DTD))] 
}