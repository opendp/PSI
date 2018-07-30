##
##  rookrestart.r
##
##  simple restart of the R.server
##

print('-- Restarting rook --')

R.server$remove(all=TRUE)
rm(list=ls())
source("rookSetup.R")
