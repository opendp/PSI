
##########################################################
# PostCDFstats
# This script defines a set of functions to be applied to (DP)CDF vectors.
# Author: Daniel Muise (2016)
# Harvard University

# Unless otherwise specified, the following functions were authored by Daniel Muise
# This document is stored in the IQSS/PrivateZelig/Summer2015/cdfs folder.  
##########################################################

### Functions Available
##########################################################
   # Diagnostic functions defined
   #   RangeQueryOnCDF    (CDFvector, CDFrange, CDFgran, lowBound=0, highBound)
   #   PercentileFromCDF  (CDFvector, CDFrange, CDFgran, percentile)
   #   ModeFromCDF        (CDFvector, CDFrange, CDFgran)
   #   MeanFromCDF        (CDFvector, CDFrange, CDFgran)
   #   ZerosFromCDF       (CDFvector)
   #   SkewnessFromCDF    (CDFvector, CDFrange, CDFgran)
   #   KurtosisFromCDF    (CDFvector, CDFrange, CDFgran)
   #   SDFromCDF          (CDFvector, CDFrange, CDFgran)
   #   The Domain (range and gran) should be identical to those used to create the CDF!!
##############################################################

RangeQueryFromCDF <- function(CDFvector, CDFrange, CDFgran, lowBound=0, highBound){

  # Args: 
  #   CDFvector: the vector output of a (differentially private) CDF computation (cumulative count bins)
  #   CDFrange: a vector length 2 containing user-specified min and max of the CDF's Domain
  #   gran: the smallest unit of measurement in the data (ie, one [year] for a list of ages)
  #   lowBound & highBound: the quantile values bounding the range query.
  #   The Domain (ie gran and range) should be identical to those used to create the CDF!!

  # Returns:
  #  The proportion of observations with values larger than lowBound and smaler than highBound 
   #   This works off of "strictly less than/ greater than", not "... or equal to"
   #   set lowBound to 0 for get a quantile value

Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
storage <- c(0,1)

for (x in 1: length(Domain)){
  if (Domain[x] < highBound){
    storage[2] <- CDFvector[x]
  }
  if (Domain[x] == highBound){
    storage[2] <- CDFvector[x-1]
  }
}


if (lowBound != 0){
  for (x in length(Domain):1){
    if (Domain[x] > lowBound){
       storage[1] <- CDFvector[x]
       }
    if (Domain[x] == lowBound){
       storage[1] <- CDFvector[x+1]
       }
  }
}
proportion <- storage[2] - storage[1]
return(proportion)
}

################################################################################
PercentileFromCDF <- function(CDFvector, CDFrange, CDFgran, percentile){

  # Args: 
  #   CDFvector:  the vector output of a differentially private CDF computation (cumulative count bins)
  #   CDFrange:   a vector length 2 containing user-specified min and max to truncate the universe to
  #   CDFgran:    the smallest unit of measurement in the data (one [year] for a list of ages)
  #   percentile: any value from 1 to 100. 
  #   The Domain (ie gran and range) should be identical to those used to create the CDF!!

  # Returns:
  #  A quantile value obtained from a (differentially private) CDF vector, not using any extra privacy budget
Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
outputvalue <- 0
DifferenceVector <- CDFvector-(percentile/100)

for (z in 1: length(DifferenceVector)){
  if (DifferenceVector[z] >0) {
    DifferenceVector[z] <- -10
  }
}
maxDiff <- max(DifferenceVector)

for (x in (length(DifferenceVector)):1){
  if (DifferenceVector[x] == maxDiff){
    outputvalue <- Domain[x]
  }
}
return(outputvalue)
}

########################################################################################################
ModeFromCDF <- function(CDFvector, CDFrange, CDFgran){

  # Args: 
  #   CDFvector: the vector output of a differentially private CDF computation (cumulative count bins)
  #   CDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   CDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the CDF!!

  # Returns:
  #  A mode or vector of modes obtained from a (differentially private) CDF vector, not using any extra privacy budget

Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
print(Domain)
PDFvector <- c(CDFvector[1])
Mode <- c()
for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}
print(PDFvector)
for (x in 1:length(PDFvector)){
  if (PDFvector[x] == (max(PDFvector))){
    Mode[length(Mode)+1] <- Domain[x]

}
}
return(Mode)
}
###################################################################################################

########################################################################################################
MeanFromCDF <- function(CDFvector, CDFrange, CDFgran){

  # Args: 
  #   CDFvector: the vector output of a differentially private CDF computation (cumulative count bins)
  #   CDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   CDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the CDF!!

  # Returns:
  #  A mean obtained from a (differentially private) CDF vector, not using any extra privacy budget

Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)

PDFvector <- c(CDFvector[1])

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}
for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}
weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}

mean <- sum( weights )
return(mean)
}
###################################################################################################

ZerosFromCDF <- function(CDFvector){

  # Args: 
  #   CDFvector: the vector output of a differentially private CDF computation (cumulative count bins)
  #   CDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   CDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the CDF!!
  
  # Returns:
  #  The percent of Domain bins with count = 0 obtained from a (differentially private) CDF vector, not using any extra privacy budget
  #  note, this is useless on monotonic CDFs.

PDFvector <- c(CDFvector[1])
ZeroCount <- 0

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}

for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}

for (x in 1:length(PDFvector)){
  if (PDFvector[x] == 0){
    ZeroCount <- ZeroCount + 1
  }
}

ZeroPercent <- (100*ZeroCount)/length(CDFvector)
return(paste(round(ZeroPercent,2),"%"))
}

######################################################################################

SkewnessFromCDF <- function(CDFvector, CDFrange, CDFgran){

  
  #determines the skewness of a univariate distribution taken from a DP-CDF vector

Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
PDFvector <- c(CDFvector[1])

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}

for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}

#create the mean from the normalized histogram/ empirical PDF vector
weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}
mean <- sum(weights)

#create standard deviation

distances <- c()
for (z in 1: length(Domain)){
  distances[z] <- ((mean - Domain[z])^2) * (PDFvector[z])
}

stddev <- sqrt(sum(distances))

skewness <- mean(((weights-mean)/ stddev)^3)

return(skewness)
}

#################################################################e

VarianceFromCDF <- function(CDFvector, CDFrange, CDFgran){

  #determines the standard Deviation of a univariate distribution taken from a DP-CDF vector


Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
PDFvector <- c(CDFvector[1])

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}

for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}

#create the mean from the normalized histogram/ empirical PDF vector
weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}
mean <- sum(weights)

#create standard deviation

distances <- c()
for (z in 1: length(Domain)){
  distances[z] <- ((mean - Domain[z])^2) * (PDFvector[z])
}

variance <- sum(distances)
return(variance)
}
#################################################################e

SDFromCDF <- function(CDFvector, CDFrange, CDFgran){

  #determines the standard Deviation of a univariate distribution taken from a DP-CDF vector

Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
PDFvector <- c(CDFvector[1])

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}

for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}

#create the mean from the normalized histogram/ empirical PDF vector
weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}
mean <- sum(weights)

#create standard deviation

distances <- c()
for (z in 1: length(Domain)){
  distances[z] <- ((mean - Domain[z])^2) * (PDFvector[z])
}

stddev <- sqrt(sum(distances))
return(stddev)
}
#################################################################e

KurtosisFromCDF <- function(CDFvector, CDFrange, CDFgran){

  #determines the kurtosis of a univariate distribution taken from a DP-CDF vector
Domain <- seq(from=CDFrange[1], to=CDFrange[2], by=CDFgran)
PDFvector <- c(CDFvector[1])

for (x in (length(CDFvector)):2){
PDFvector[x] <- CDFvector[x] - CDFvector[x-1]
}

for(i in 1: length(PDFvector)){
  if(PDFvector[i] < 0){
    PDFvector[i] <-0
  }
}

#create the mean from the normalized histogram/ empirical PDF vector
weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}
mean <- sum(weights)

#create standard deviation

distances <- c()
for (z in 1: length(Domain)){
  distances[z] <- ((mean - Domain[z])^2) * (PDFvector[z])
}

variance <- sum(distances)

moment4 <- (mean(distances))
sigma4  <-  variance^2
#normalize the 4th moment
kurtosis <- moment4/sigma4

return(kurtosis)
}
#################################

CDFfromCDF <- function(CDFvector, granScale){

# creates a lower resolution CDF from the DP-CDF
# use granScale to scale up the granularity.
# for example, using granScale = 3 creates a CDF with 1/3 as many bins as the original CDF
# (i.e., the new CDF has bins 3 times as wide as the original's)
# domain vectors do not need to change! the output CDF vector is of equal length to the input CDF vector

if (granScale%%1 !=0 | granScale <1){
  print("scaling parameter must be a positive integer.")
  return(c(0))
}

newCDF <- c()
locator <- floor(length(CDFvector)/granScale)
for(l in 1:(locator)){
  newCDF[(length(newCDF)+1):(length(newCDF)+granScale)] <- mean(CDFvector[(((l-1)*granScale)+1):(granScale*l)])
  }

# cap the CDF vector with full prob. 
# either fills in the last bin or make a new final bin so that the final length = length(CDFvector).
    if ((locator*granScale) < (length(CDFvector))){
      newCDF[((locator*granScale)+1):length(CDFvector)] <- 1
    }
    else{
      newCDF[ ((length(newCDF)-granScale)+1):length(newCDF)] <- 1
    }

return(newCDF)  
}
##################################################

HistfromCDF <- function(CDFvector, granScale =1){

  # creates a Histogram/ empirical CDF from the DP-CDF
# use granScale to scale up the granularity if desired (defaults to 1).
# for example, using granScale = 3 creates a histogram with 1/3 as many bins as the original CDF

  if (granScale%%1 != 0| granScale <1){
  print("scaling parameter must be a positive integer.")
  return(c(0))
}

Hist<-c()
  Hist[1]<-CDFvector[1]
  for(v in length(CDFvector):2){
                Hist[v] <- CDFvector[v]- CDFvector[v-1]
}

  if (granScale !=1){
  lowReshist <- c()
  locator <- floor(length(Hist)/granScale)
    for(l in 1:(locator)){
      lowReshist[(length(lowReshist)+1):(length(lowReshist)+granScale)] <- mean(Hist[(((l-1)*granScale)+1):(granScale*l)])
    }

    if ((locator*granScale) < (length(CDFvector))){
      lowReshist[(length(lowReshist)+1):length(CDFvector)] <- mean(Hist[((locator*granScale)+1):(length(Hist))])
    }

  return(lowReshist)
  }

else{return(Hist)}
}
#################################

# vector <- sort(rnorm(100,.5,.2))

# vector[length(vector)] <- 1

# ######################################

# veccy <- rnorm(10000,50,20)
# CDF           <- ecdf(veccy)     # use the ecdf function to define my CDF function, for an ordindary CDF
# realCDFoutput <- CDF ((seq(1,100,1))) # fill the realCDF vector

# sd(veccy)
