#
# HeavyHitters.R
# Author : Victor Balcer (vbalcer@ucsd.edu)
# Summer 2014 REU - Harvard University
#
# Description:
#    Contains functions for privately releasing the top-k heavy hitters in
#    addition to functions for computing privacy and accuracy parameters.
#
#    The following argument names are used throughout this file:
#
#       - data - vector of elements drawn from the universe
#       - n - number of elements in data
#
#       - k - top-k elements to return
#
#       - eps - epsilon privacy parameter
#       - del - delta privacy parameter
#
#       - acc - alpha accuracy paramater
#       - beta - maximum failure probability (default : .05)
#
#       - symb - symbol to return on failure (default : NA)
#

# Imports
library(VGAM)


stabilityHeavyHitters <- list(
      "release"=function(data, eps, del, k=1, symb=NA)
      #
      # Description:
      #    Calculates the gap between the k and the k+1 most common with added
      #    Laplace noise. If the noisy gap is sufficiently large, it returns the
      #    top-k heavy hitters.
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    the top-k heavy hitters or symb
      #
      {
         hist <- table(factor(data, exclude=c()), useNA="ifany")

         # TODO: possible violation of privacy
         if(k > length(hist) - 1)
         {
            return(symb)
         }

         # TODO: should be replaced with a partial sorting algorithm
         hist <- sort(hist, decreasing=TRUE)[1:(k+1)]

         gap <- hist[k] - hist[k+1] + rlaplace(1, scale=2/eps)

         return(ifelse(gap < -2 / eps * log(del), symb, names(hist[1:k])))
      },

      "getAccuracy"=function(gap, eps, del)
      #
      # Description:
      #    Calculates the maximum failure probability determined from the
      #    approximated gap and given parameters.
      #
      # Input:
      #    refer to source header
      #    gap - expected gap between the k-th and (k+1)-st heaviest counts
      #
      # Return:
      #    beta accuracy parameter
      #
      {
         return(exp(-eps * gap / 2) / del)
      },

      "getParameters"=function(gap, del, beta=.05)
      #
      # Description:
      #    Calculates the best epsilon privacy parameter determined from the
      #    approximated gap and given parameters.
      #
      # Input:
      #    refer to source header
      #    gap - expected gap between the k-th and (k+1)-st heaviest counts
      #
      # Return:
      #    epsilon privacy parameter
      #
      {
         return(-2 * log(beta * del) / gap)
      })


choosingMechanismMode <- list(
      "release"=function(data, eps, del, beta=.05, symb=NA)
      #
      # Description:
      #    Calculates an approximation of the mode using the exponential
      #    mechanism on all non-zero counts if the mode is large.
      #
      # Input:
      #    refer to source header
      #
      # Return:
      #    the approximate mode or symb
      #
      {
         n <- length(data)

         hist <- table(factor(data, exclude=c()), useNA="ifany")

         best <- max(hist)

         if(best + rlaplace(1, scale=4/eps) < 8/eps * log(4 / (beta*del*eps)))
         {
            return(symb)
         }

         # exponential mechanism (approximation due to underflow)
         hist <- ifelse(hist == 0, 0, exp(eps / 4 * (hist - best)))

         return(sample(names(hist), 1, prob=hist))
      })
