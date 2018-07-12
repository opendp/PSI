#
# Histogram.R
# Author : Victor Balcer (vbalcer@ucsd.edu)
# Summer 2014 REU - Harvard University
#
# Description:
#    Contains functions for computing a differentially private histogram of the
#    data in addition to the privacy and accuracy parameters.
#
#    The following argument names are used throughout this file (unused
#    parameters are defaulted to NULL):
#
#       - bins - universe from which the data is drawn
#       - nbins - number of values that data can take on
#
#       - data - vector of elements drawn from the universe
#       - n - number of elements in data
#
#       - eps - epsilon privacy parameter
#       - del - delta privacy parameter
#
#       - acc - alpha accuracy paramater
#       - beta - maximum failure probability
#

# Imports
library(VGAM)

histogram <- list(
      "release"=function(bins=Inf, data, eps, del=2^-30, beta=0.05)
      #
      # Description:
      #    Wrapper function for releasing a differentially private histogram
      #    choosing the best algorithm based on the given privacy parameters and
      #    the parameters of the data.
      #
      # Input:
      #    refer to source header
      #    bins - if it has length one that value is considered to be nbins
      #
      # Return:
      #    noisy histogram as a table
      #
      {
         n <- length(data)
         nbins <- length(bins)

         if(nbins < 1)
         {
            stop("bins must have length at least 1.")
         }

         if(nbins == 1)
         {
            acc <- stabilityHistogram$getAccuracy(nbins, n, eps, del, beta)
            return(stabilityHistogram$release(nbins, data, eps, del, acc))
         }

         acs <- c(noisyHistogram$getAccuracy(nbins, n, eps, beta),
                  stabilityHistogram$getAccuracy(nbins, n, eps, del, beta),
                  randomizedResponseHistogram$getAccuracy(nbins, n, eps, beta))

         if(min(acs) == Inf)
         {
            stop("No algorithm provides an accurate and private histogram under the given parameters.")
         }

         indx <- which.min(acs)
         if(indx == 1)
         {
            noisyHistogram <- noisyHistogram$release(bins, data, eps)
            params <- list( eps=eps, del=del, n=n, bins=bins)

            return(list(release=noisyHistogram, params=params))
         }
         else if(indx == 2)
         {
            acc <- min(acs)
            return(stabilityHistogram$release(bins, data, eps, del, acc))
         }
         else if(indx == 3)
         {
            return(randomizedResponseHistogram$release(bins, data, eps))
         }
      },

      "getAccuracy"=function(nbins=Inf, n, eps, del, beta=.05)
      #
      # Description:
      #    Calculates the best alpha accuracy parameter by iterating over the
      #    accuracy function of the different histogram functions with the given
      #    parameters.
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    alpha accuracy parameter
      #
      {
         acs <- c(noisyHistogram$getAccuracy(nbins, n, eps),
                  stabilityHistogram$getAccuracy(nbins, n, eps, del),
                  randomizedResponseHistogram$getAccuracy(nbins, n, eps))
         return(min(acs))
      },

      "getParameters"=function(nbins=Inf, n, del, acc, beta=.05)
      #
      # Description:
      #    Calculates the best epsilon privacy parameter by iterating over the
      #    parameter function of the different histogram functions with the
      #    given parameters.
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    epsilon privacy parameter
      #
      {
         acs <- c(noisyHistogram$getParameters(nbins, n, acc),
                  stabilityHistogram$getParameters(nbins, n, del, acc))
                  #,randomizedResponseHistogram$getParameters(nbins, n, acc)) #JM edited 
         return(min(acs))
      })


noisyHistogram <- list(
      "release"=function(bins, data, eps)
      #
      # Description:
      #    Laplace mechanism. Independent Laplace noise is added to each count.
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    noisy histogram as a table
      #
      {
         if(length(bins) < 2)
         {
            stop("The number of bins cannot be less than 2.")
         }

         hist <- table(factor(data, levels=bins, exclude=c()), useNA="ifany")
         return(hist + rlaplace(length(hist), scale=2/eps))
      },

      "getAccuracy"=function(nbins, n, eps, beta=.05)
      #
      # Description:
      #    Calculates the alpha accuracy parameter such that the probability all
      #    counts are with within alpha * n of their true counts with high
      #    probability (1 - beta). (L-infinity norm)
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    alpha accuracy parameter
      #
      {
         acc <- -2*log(1 - (1-beta)^(1/nbins)) / (n * eps)
         return(acc)       
      },
      
      "getParameters"=function(nbins, n, acc, beta=.05)
      #
      # Description:
      #    Calculates the epsilon privacy parameter such that the probability
      #    all counts are within alpha * n of their true counts with high
      #    probability (1 - beta). (L-infinity norm)
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    Returns the epsilon privacy parameter.
      #
      {
         eps <- -2*log(1 - (1-beta)^(1/nbins)) / (n * acc)
         return(eps)
      })


stabilityHistogram <- list(
      "release"=function(bins=Inf, data, eps, del, acc, beta=.05)
      #
      # Description:
      #    Independent Laplace noise is added to each count that exceeds the
      #    given accuracy threshold. Other counts are removed from the table.
      #    It can be assumed they have a value of 0.
      #
      # Input:
      #    refer to source header
      #    bins - if it has length one that value is considered to be nbins
      #
      # Return:
      #    the noisy histogram as a table (only significant counts are kept)
      #
      {
         n <- length(data)
         nbins <- length(bins)

         if(nbins < 1)
         {
            stop("bins must have length at least 1.")
         }

         nlv <- (nbins == 1)
         if(nlv)
         {
            nbins <- bins
            if(nbins < 2)
            {
               stop("Number of bins must be at least 2.")
            }
         }

         if(n < max(8/acc * (1/2 - log(del)/eps),
               4 * log(min(nbins, 4 / acc) / beta) / (acc * eps)))
         {
            stop("Number of rows in the data is not large enough to provide privacy or accuracy under the given paramters")
         }

         if(nlv)
         {
            hist <- table(factor(data, exclude=c()), useNA="ifany")            
         }
         else
         {
            hist <- table(factor(data, levels=bins, exclude=c()), useNA="ifany")
         }

         a <- acc * n / 2

         # excludes all counts below the threshold in the returned table
         hist <- hist[hist >= a/2]
         if(length(hist) == 0)
         {
            return(hist)
         }

         hist <- hist + rlaplace(n=length(hist), scale=2/eps)
         hist <- hist[hist >= a]
         return(hist)
      },

      "getAccuracy"=function(nbins=Inf, n, eps, del, beta=.05, error=1e-9)
      #
      # Description:
      #    Calculates the alpha accuracy parameter such that the probability
      #    all counts are with within alpha * n of their true counts with high
      #    probability (1 - beta). (L-infinity norm)
      #    An estimation of the parameter using binary search on (0,1).
      #
      # Input:
      #    refer to source header
      #    error - maximum devaition allowed from beta (only below)
      #
      # Return:
      #    Returns the alpha accuracy parameter.
      #
      {
         low <- 0
         high <- 1
         eval <- beta + error

         while((eval <= beta - error) || (eval > beta))
         {
            acc <- (high + low) / 2
            eval <- min(4 / acc, nbins) * exp(-acc * n * eps / 4)

            if(eval < beta)
            {
               high <- acc
            }
            else
            {
               low <- acc
            }

            if(high - low <= 0)
            {
               return(Inf)
            }
         }

         acc <- max(acc, 8/n * (1/2 - log(del)/eps))
         return(acc)
      },

      "getParameters"=function(nbins=Inf, n, del, acc, beta=.05, error=1e-9)
      #
      # Description:
      #    Calculates the epsilon privacy parameter such that the probability
      #    all counts are within alpha * n of their true counts with high
      #    probability (1 - beta). (L-infinity norm)
      #    An estimation of the parameter using binary search on (0,1).
      #
      # Input:
      #    refer to source header
      #    error - maximum deviation (mutiplicative) allowed from n (only below)
      #
      # Return:
      #    Returns the epsilon privacy parameter.
      #
      {
         low <- 0
         high <- 1
         eval <- n + 1

         while((eval <= n * (1 - error)) || (eval > n))
         {
            eps <- (high + low) / 2
            eval <- 8 / acc * (1/2 - log(del)/eps)

            if(eval < n)
            {
               high <- eps
            }
            else
            {
               low <- eps
            }

            if(high - low <= 0)
            {
               return(Inf)
            }
         }

         eps <- max(eps, 4 * log(min(nbins, 4 / acc) / beta) / (acc * n))
         return(eps)
      })


randomizedResponseHistogram <- list(
         "release"=function(bins, data, eps)
         #
         # Description:
         #    Creates a new database from the existing with bias given towards
         #    to the correct values. After the histogram of the new database.
         #    The counts in this histogram are scaled to make the expectation of
         #    the error 0 for each count.
         #
         # Input:
         #    refer to source header
         #
         # Return:
         #    noisy histogram as a table
         {
            nbins <- length(bins)
            n <- length(data)

            if(nbins < 2)
            {
               stop("bins must have length at least 2.")
            }

            if(eps > log((nbins + 1) / (nbins - 1)))
            {
               stop("Epsilon is too large to guarantee differential privacy.")
            }

            pr_diff <- 1 / nbins * exp(-eps)
            pr_same <- 1 - (nbins - 1) * pr_diff

            # performs randomized response to create new database
            for(i in 1:n)
            {
               if(runif(1) >= pr_same)
               {
                 row <- sample(1:(nbins - 1), 1)

                  if(row >= data[i])
                  {
                     data[i] <- bins[row + 1]
                  }
                  else
                  {
                     data[i] <- bins[row]
                  }
               }
            }

            # post-processing
            hist <- table(factor(data, levels=bins, exclude=c()), useNA="ifany")

            m <- 1 / (pr_same - pr_diff)
            b <- pr_diff * n * m
            hist <- m * hist - b

            return(hist)
         },
         
         "getAccuracy"=function(nbins, n, eps, beta=.05)
         #
         # Description:
         #    Calculates the alpha accuracy using the L-infinity norm with the
         #    given parameters.
         #
         # Input:
         #    refer to source header
         #
         # Return:
         #    alpha accuracy parameter
         #
         {
            # TODO
            return(Inf)
         },
         
         "getParameters"=function(nbins, n, acc, beta=.05)
         #
         # Description:
         #    Calculates the epsilon privacy parameter with the desired accuracy
         #    using the L-infinity norm. 
         #
         # Input:
         #    refer to source header
         #
         # Return:
         #    epsilon privacy parameter
         #
         {
            # TODO
            eps <- log((nbins + 1) / (nbins - 1))
            return(eps)
         })
