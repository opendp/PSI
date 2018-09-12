##
##  rookSetup
##
##  Update and load dependencies, load privacy functions, initialize server and source in the rook apps (now a separate file).
##
##  28/10/16 jH
##
source("rookconfig.R") # global variables such as "IS_PRODUCTION_MODE"


packageList<-c("Rook","jsonlite","openssl", "devtools")
for(i in 1:length(packageList)){
    if (!require(packageList[i],character.only = TRUE)){
        install.packages(packageList[i], repos="http://lib.stat.cmu.edu/R/CRAN/")
    }
}

#update.packages(ask = FALSE, dependencies = c('Suggests'), oldPkgs=packageList, repos="http://lib.stat.cmu.edu/R/CRAN/")


library(Rook)
library(jsonlite)

source("rookhealthcheck.R")
modulesPath<-("dpmodules/Jack/")
libraryPath<-("../PSI-Library/R/")
source(paste(modulesPath,"DPUtilities.R", sep=""))
#source(paste(modulesPath,"GetFunctions.R", sep=""))
#source(paste(modulesPath,"GetFunctionsWithPSIlence.R", sep=""))
source(paste(modulesPath,"GetFunctionsWithPSIlenceHardCode.R", sep=""))
source(paste(modulesPath,"update_parameters.R", sep=""))
source(paste(modulesPath,"Calculate_stats.R", sep=""))
#source(paste(modulesPath,"Histogramnew.R", sep=""))
source(paste(modulesPath,"CompositionTheorems.R", sep=""))
#source(paste(modulesPath,"DP_Quantiles.R", sep=""))
#source(paste(modulesPath,"DP_Means.R", sep=""))
#source(paste(modulesPath,"DP_CDFs.R", sep=""))
source(paste(modulesPath,"ReadJSON.R", sep=""))
source(paste(modulesPath,"CreateXML.R", sep=""))
source(paste(modulesPath,"transform.R", sep=""))
# Eventually we should have ATT code in library
library("VGAM") # for rlaplace in ATT code. Replace eventually.
source(paste(modulesPath,"cem-utilities.R", sep=""))
source(paste(modulesPath,"dpATT.R", sep=""))
source(paste(modulesPath,"dpCEM.R", sep=""))
source(paste(modulesPath,"CEM_getFunctions.R", sep=""))
source(paste(modulesPath,"updatedRttpd.R", sep=""))

#source PSIlence
UsePackage <- TRUE
if(!IS_PRODUCTION_MODE && UsePackage){
   library(devtools)
   install_github("IQSS/PSI-Library")
}
library(PSIlence)

if(!UsePackage){
     source(file.path(libraryPath, "mechanisms.R"))
     for (file in list.files(libraryPath)) {
	     source(file.path(libraryPath, file))
    }
  }
#source("./dpmodules/PostCDFstats.R")


## Get the server connection set up

if(!IS_PRODUCTION_MODE){
    myPort <- "8000"
    myInterface <- "0.0.0.0"
    #myInterface <- "127.0.0.1"
    #myInterface <- "140.247.0.42"
    status <- -1
    if (as.integer(R.version[["svn rev"]]) > 72310) {
        status <- .Call(tools:::C_startHTTPD, myInterface, myPort)
    } else {
        status <- .Call(tools:::startHTTPD, myInterface, myPort)
    }


    if( status!=0 ){
        print("WARNING: Error setting interface or port")
        stop()
    }

    # Allow listening outside of the local host
    #
    unlockBinding("httpdPort", environment(tools:::startDynamicHelp))
    assign("httpdPort", myPort, environment(tools:::startDynamicHelp))

    R.server <- Rhttpd2$new()

    cat("Type:", typeof(R.server), "Class:", class(R.server))
    R.server$add(app = File$new(getwd()), name = "pic_dir")
    print(R.server)

    #R.server$start(listen=myInterface, port=myPort)
    R.server$listenAddr <- myInterface
    R.server$listenPort <- myPort

}

source("rookPrivate.R")
source("rookTransform.R")


if(!IS_PRODUCTION_MODE){
    R.server$add(app = privateAccuracies.app, name = "privateAccuraciesapp")
    R.server$add(app = privateStatistics.app, name = "privateStatisticsapp")
    R.server$add(app = verifyTransform.app, name = "verifyTransformapp")
    R.server$add(app = healthcheck.app, name="healthcheckapp")
    print(R.server)
}


# Other useful commands (see also "myrookrestart.R"):
#R.server$browse("myrookapp")
#R.server$stop()
#R.server$remove(all=TRUE)
