#
# ExampleView.R
# Author : Victor Balcer (vbalcer@ucsd.edu)
# Summer 2014 REU - Harvard University
#
# Description:
#    Simple example code to compare a differentially private histogram with the
#    true histogram for a synthetic database.
#

# Imports
source("Histogram.R")

exampleView <- function(nbins=5, prob=NULL, n=125000, eps=1e-2, del=9e-10, w=.1,
                        beta=.05)
#
# Description:
#    Creates a synthetic database from the given parameters and then computes
#    differentially private histograms using the laplace mechanism and the
#    stability based mechanism.
#
# Input:
#    nbins - number of bins to generate
#    prob - probability distribution of the bins (default : uniform)
#    n - number of samples to generate
#    eps - epsilon privacy parameter
#    del - delta privacy parameter
#    w - width of error bars
#    beta - failure probability
#
{
   par(ask=TRUE)

   # generate data
   bins <- 1:nbins
   data <- sample(bins, n, replace=TRUE, prob=prob)

   # calculate histograms
   hist <- table(factor(data, levels=bins, exclude=c()))

   accnh <- noisyHistogram$getAccuracy(n, eps, beta) * n
   nhist <- noisyHistogram$release(bins, data, eps)
   accsh <- stabilityHistogram$getAccuracy(n, eps, del, beta) * n
   shist <- stabilityHistogram$release(bins, data, eps, del)

   # plot results
   bplot <- barplot(rbind(hist, nhist, shist),
         ylim=range(0, range(hist, nhist, shist) + max(accnh, accsh)),
         col=c("grey", "purple", "pink"), names.arg=bins, beside=T, axis.lty=1,
         main="Histograms of Synthetic Data", xlab="Bins", ylab="Frequencies")
   mtext(paste("n =", n, ", eps =", eps, ", del=", del), side=3)

   # add error bars
   xs <- 4 * bins - 1.5
   arrows(xs, nhist - accnh[1], xs, nhist + accnh[1], code=3, length=w,
         angle=90)

   low <- ifelse(shist == 0, shist - accsh[2], shist - accsh[1])
   high <- ifelse(shist == 0, shist + accsh[2], shist + accsh[1])

   arrows(xs + 1, low, xs + 1, high, code=3, length=w, angle=90)

   lines(c(0.5, 4*length(bins)), c(-2/eps*log(2*del)+1, -2/eps*log(2*del)+1),
         lty=1, lwd=2)

   legend("topright", legend=c("Histogram", "Noisy Histogram",
         "Stability Histogram"), fill=c("grey","purple", "pink"), bg="white")

   par(ask=FALSE)
}
