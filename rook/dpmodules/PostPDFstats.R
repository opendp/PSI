
##########################################################
# PostCDFstats
# This script defines a set of functions to be applied to PDF vectors.
# Author: Daniel Muise (2016)
# Harvard University

# Unless otherwise specified, the following functions were authored by Daniel Muise
##########################################################

### Functions Available
##########################################################
   # Diagnostic functions defined
   #   RangeQueryOnPDF    (PDFvector, PDFrange, PDFgran, lowBound=0, highBound)
   #   PercentileFromPDF  (PDFvector, PDFrange, PDFgran, percentile)
   #   ModeFromPDF        (PDFvector, PDFrange, PDFgran)
   #   MeanFromPDF        (PDFvector, PDFrange, PDFgran)
   #   ZerosFromPDF       (PDFvector)
   #   The Domain (range and gran) should be identical to those used to create the PDF!!
##############################################################

RangeQueryOnPDF <- function(PDFvector, PDFrange, PDFgran, lowBound=0, highBound){

  # Args: 
  #   PDFvector: the vector output of a (differentially private) PDF computation
  #   PDFrange: a vector length 2 containing user-specified min and max of the PDF's Domain
  #   gran: the smallest unit of measurement in the data (ie, one [year] for a list of ages)
  #   lowBound & highBound: the quantile values bounding the range query.
  #   The Domain (ie gran and range) should be identical to those used to create the PDF!!

  # Returns:
  #  The proportion of observations with values larger than lowBound and smaller than highBound 
   #   This works off of "strictly less than/ greater than", not "... or equal to"
   #   set lowBound to 0 for get a quantile value

Domain <- seq(from=PDFrange[1], to=PDFrange[2], by=PDFgran)
storage <- c(0,1)


CDFvector <- PDFvector[1]
for (x in 2:length(PDFvector)){
CDFvector[x] <- PDFvector[x] + CDFvector[x-1]
}
CDFvector[length(CDFvector)]<-1

print(Domain)
print(PDFvector)
print(CDFvector)

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
PercentileFromPDF <- function(PDFvector, PDFrange, PDFgran, percentile){

  # Args: 
  #   PDFvector:  the vector output of a differentially private CDF computation 
  #   PDFrange:   a vector length 2 containing user-specified min and max to truncate the universe to
  #   PDFgran:    the smallest unit of measurement in the data (one [year] for a list of ages)
  #   percentile: any value from 1 to 100. 
  #   The Domain (ie gran and range) should be identical to those used to create the PDF!!

  # Returns:
  #  A quantile value obtained from a (differentially private) PDF vector, not using any extra privacy budget
Domain <- seq(from=PDFrange[1], to=PDFrange[2], by=PDFgran)
outputvalue <- 0
CDFvector <- PDFvector[1]
for (x in 2:length(PDFvector)){
CDFvector[x] <- PDFvector[x] + CDFvector[x-1]
}
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
ModeFromPDF <- function(PDFvector, PDFrange, PDFgran){

  # Args: 
  #   PDFvector: the vector output of a differentially private CDF computation
  #   PDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   PDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the PDF!!

  # Returns:
  #  A mode or vector of modes obtained from a (differentially private) PDF vector, not using any extra privacy budget

Domain <- seq(from=PDFrange[1], to=PDFrange[2], by=PDFgran)
Mode <- c()

for (x in 1:length(PDFvector)){
  if (PDFvector[x] == (max(PDFvector))){
    Mode[length(Mode)+1] <- Domain[x]
}
}
return(Mode)
}
###################################################################################################

########################################################################################################
MeanFromPDF <- function(PDFvector, PDFrange, PDFgran){

  # Args: 
  #   PDFvector: the vector output of a differentially private CDF computation 
  #   PDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   PDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the PDF!!

  # Returns:
  #  A mean obtained from a (differentially private) CDF vector, not using any extra privacy budget

Domain <- seq(from=PDFrange[1], to=PDFrange[2], by=PDFgran)

weights <-c()
for (x in 1:length(Domain)){
  weights[x] <- ( PDFvector[x] * Domain[x] )
}

mean <- sum(weights)
return(mean)
}
###################################################################################################

ZerosFromPDF <- function(PDFvector){

  # Args: 
  #   PDFvector: the vector output of a differentially private PDF computation 
  #   PDFrange: a vector length 2 containing user-specified min and max to truncate the universe to
  #   PDFgran: the smallest unit of measurement in the data (one [year] for a list of ages)
  #   Domain is made of the sequence from range[1] to range[2] of your data, stepped by granularity
  #   The Domain (ie gran and range) should be identical to those used to create the PDF!!
  
  # Returns:
  #  The percent of Domain bins with count = 0 obtained from a (differentially private) PDF vector, not using any extra privacy budget
  #  note, this is useless on monotonized CDFs.

ZeroCount <- 0

for (x in 1:length(PDFvector)){
  if (PDFvector[x] == 0){
    ZeroCount <- ZeroCount + 1
  }
}

ZeroPercent <- (100*ZeroCount)/length(PDFvector)
return(paste(round(ZeroPercent,2),"%"))
}
