#
# ExampleAOL.R
# Author : Victor Balcer (vbalcer@ucsd.edu)
# Summer 2014 REU - Harvard University
#
# Description:
#    Example code to privately release the mode and calculate the histogram of
#    the most frequent elements in the database.
#
#    Note that this only provides word level privacy and not user level privacy.
#
#    The entire dataset can be downloaded from the following link. As of
#    2014-07-15 the link is still active.
#       http://www.infochimps.com/datasets/aol-search-data
#

# Imports
source("Histogram.R")
source("HeavyHitters.R")


exampleAOL <- function(fname="user-ct-test-collection-01.txt", words=TRUE,
                       eps=1e-2, del=9e-10)
#
# Description:
#    Computes the mode using aDist and the choosing mechanism from
#    HeavyHitters.R. Computes the histogram using the biased noisy algorithm
#    from Histogram.R. Approximate expected results are shown inline for default
#    parameters.
#
# Input:
#    fname - file name for reading data. Assumed that columns are delimited by
#            tabs, the first line is a header and "-" is used to denote a
#            redacted query.
#    words - TRUE to split each search query into strings using any
#            non-alphanumeric character as a delimiter
#    eps - epsilon privacy parameter
#    del - delta privacy parameter
#    acc - alpha accuracy parameter
#
{
   # print function that prepends the time

   tcat <- function(expr)
   {
      cat(paste(Sys.time(), expr, "\n"))
   }


   # reads the file from memory (4min)

   tcat("Reading from file...")
   datafile <- file(fname, "r")
   table <- read.table(datafile, sep="\t", fill=TRUE, header=T, na.strings="-")
   close(datafile)
   tcat("File closed.")


   # splits searches into individual words if flag is set

   if(words)
   {
      tcat("Spliting searches...")
      queries <- unlist(strsplit(as.character(table[,2]), "\\W+"))
      tcat("Done processing.")
   }
   else
   {
      queries <- unlist(as.character(table[,2]))
   }
   queries <- queries[!is.na(queries)]

   # privacy and accuracy parameters

   tcat(paste("Paramters: n =", length(queries), ", eps =", eps, ", del =",
         del))

   # computing differentially private algorithms

   tcat("Running stabilityHistogram...")
   pt <- system.time(
         hist <- stabilityHistogram$release(, queries, eps, del))
   print(pt)
   # Something similar to the following
   # words=TRUE :   "2006"   "com"  "www" "http" "03"
   # words=FALSE: "google" "yahoo" "ebay"
   top <- sort(hist, decreasing=TRUE)
   tcat("Most common:")
   tcat(names(top)[1:min(length(top), 5)])

   tcat("Runnning aDistMode...")
   pt <- system.time(mode <- stabilityHeavyHitters$release(queries, eps, del))
   print(pt)
   # words=TRUE : 2006
   # words=FALSE: google
   tcat(paste("Mode:", mode))

   tcat("Running choosingMechanismMode...")
   pt <- system.time(
         mode <- choosingMechanismMode$release(queries, eps, del))
   print(pt)
   # likely one of the following results below, but not necessarily
   tcat(paste("Mode:", mode))
}
