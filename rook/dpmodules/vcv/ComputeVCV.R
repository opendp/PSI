# ComputeVCV.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

## Main Method #################################################################
ComputeVCV <- function(theData, mean, min, max, esp, del, L2BOUND) {
  # Releases the covariance matrix in a differentially private manner
  #
  # It guarantees (epsilon, delta) overall DP.
  #
  # Args:
  #   theData: A matrix of the data in question (normalized)
  #   eps: The overall epsilon we want to guarantee
  #   del: The overall delta we want to guarantee
  #   L2BOUND: The bounded change of the L2 norm of each row
  #
  # Returns:
  #   The differentially private 2nd moment matrix (1/n)(D^T)D
     
  d <- ncol(theData)
  n <- nrow(theData)
           
  error <<- createErrorMatrix(min, max, esp, del, d, n, L2BOUND)
  
  # Calculate the 2nd moment matrix
  actual <<- (t(theData) %*% as.matrix(theData)) * 1/n
  release <<- actual + error
  
  return(release)
} # ComputeVCV
################################################################################

### Methods #####################################################################
VCV.getAccuracy <- function(eps, del, range, n, beta) {
  # Computes the accuracy guarantee given an (epsilon, delta)
  #
  # Args:
  #   eps: The epsilon to be used
  #   del: The delta to be used
  #   range: An a priori estimate of the range
  #   n: The number of samples in the data
  #   beta: The statistical signifcance level
  #
  # Returns:
  #   The scalar accuracy guaranteed by the given epsilon
    
  	# TODO
  
  return(returnValue)
} # Mean.getAccuracy()

VCV.getParameters <- function(acc, del, range, n, beta) {
  # Computes the epsilon value necessary for the given accuracy
  #
  # Args:
  #   acc: The accuracy we need to guarantee
  #   del: The delta to be used
  #   range: An a priori estimate of the range
  #   n: The number of samples
  #   beta: The statistical signifcance level
  #
  # Returns:
  #   The scalar epsilon necessary to guarantee the accuracy needed  
  
	# TODO
  
  return(returnValue)
} # VCV.getParameters

## Helper Methods ############################################################
createErrorMatrix <- function(min, max, eps, del, d, n, L2BOUND) {
  # Generates a d x d matrix of gaussian draws
  #
  # Args:
  #   eps: The epsilon we want to guarantee
  #   del: The delta we want to guarantee
  #   d: The number of attributes in the data
  #   n: The number of samples in the data
  #   L2BOUND: The bounded change of the L2 norm of each row
  #
  # Returns:
  #  A matrix of i.i.d. gaussian draws
  
  # sd based on [Dwork, Talwar, Thakurta, Zhang '14]
  
  theMatrix <- matrix(0, d, d)

  for (i in 1:d) {
  	row <- rnorm(d - i + 1, mean = 0, 
  							sd = (L2BOUND^2) * (sqrt(2*log(1.25/del))/eps)/n)
    
    theMatrix[i, ][i:d] <- row
    theMatrix[, i][i:d] <- row
  }
  
  original <<- theMatrix
  
  for (i in 1:d) {
  	
  	theMatrix[i, ] <- theMatrix[i, ] * (max[i] - min[i])
  	theMatrix[, i] <- theMatrix[, i] * (max[i] - min[i])
  }
  
  return(theMatrix)
} # createErrorMatrix

# scaleData() <- function(data, min, max, mean) {
  # # Method to scale the data to [0, 1]
  # #
  # # Args:
  # #   data: A matrix of the data in question
  # #   min: A vector of mins of each attribute
  # #   max: A vector of maxes of each attribute
  # #   mean: A vector of means of each attribute
  # #
  # # Returns:
  # #  Returns the scaled data matrix.
    
  # for (i in 1:ncol(data)) {				
    # data[, i] <- (data[, i] - min[i])/(max[i] - min[i])
  # }
 
  # return(data)
# } # scaleData()

# unscaleData() <- function(data, mean, min, max) {
  # # Method to unscale the data back to the 'original' ranges.
  # #
  # # Args:
  # #   data: A matrix of the data in question
  # #   min: A vector of mins of each attribute
  # #   max: A vector of maxes of each attribute
  # #   mean: A vector of means of each attribute 
  # #
  # # Returns:
  # #  Returns the unscaled 2nd moment matrix.
    
  # for(i in 1:ncol(data)) {
    # for (j in 1:nrow(data)) {
	  # data[j, i] <- (data[j, i] * (max[i] - min[i]) * (max[j] - min[j])) - (min[i] * min[j]) + (min[j]*mean[i]) + (min[i]*mean[j])
	# }
  # }
  # return(data)
# } # unscaleData()
# ################################################################################