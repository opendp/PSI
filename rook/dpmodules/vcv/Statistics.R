# Statistics.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

getSDs <- function(data) {
  # Calculates the standard deviation of each attribute in a dataset
  #
  # Args:
  #   data: A matrix of the data in question
  #
  # Returns:
  #  A vector of standard deviations of each attribute
  	
  sdev <- NULL
  for (i in 1:ncol(data)) {	
	sdev <- append(sdev, sd(data[,i]))
  }
  
  return(sdev)
} # getSDs(data)

getMeans <- function(data) {
  # Calculates the mean of each attribute in a dataset
  #
  # Args:
  #   data: A matrix of the data in question
  #
  # Returns:
  #  A vector of means of each attribute	
	
  means <- NULL	
  for (i in 1:ncol(data)) {	
    means <- append(means, mean(data[,i]))
  }
  
  return(means)
} # getMeans(data)

getMaxes <- function(data) {
  # Calculates the range of each attribute in a dataset
  #
  # Args:
  #   data: A matrix of the data in question
  #
  # Returns:
  #  A vector of range of each attribute	
	
  maxes <- NULL	
  for (i in 1:ncol(data)) {	
    maxes <- append(maxes, max(data[, i]))
  }
  return(maxes)
} # getMaxes(data)

getMins <- function(data) {
  # Calculates the min of each attribute in a dataset
  #
  # Args:
  #   data: A matrix of the data in question
  #
  # Returns:
  #  A vector of min of each attribute	
	
  mins <- NULL	
  for (i in 1:ncol(data)) {	
    mins <- append(mins, min(data[, i]))
  }
  return(mins)
} # getMins(data)