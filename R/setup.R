#  Update and load dependencies

# PSI PACKAGE OPTIONS
UsePackage <- TRUE
libraryPath<-("../PSI-Library/R/")


packageList.report <- c('rmarkdown', 'ggplot2', 'knitr', 'reshape2', 'grid', 'gridExtra', 'xtable')

# all known apps use these packages
packageList.any <- c('PSIlence', 'jsonlite', "openssl", "devtools")

installPackages <- function(packageList) {
    print(paste("load packages...", sep=""))

    # Find an available repository on CRAN
    availableRepos <- getCRANmirrors()
    flag <- availableRepos$Country=="USA" & grepl("https",availableRepos$URL,)
    useRepos <- sample(availableRepos$URL[flag],1)

    ## install missing packages, and update if newer version available
    for(i in 1:length(packageList)){
        print(packageList[i])
        if (!require(packageList[i],character.only = TRUE)){

            if (packageList[i] == "PSIlence") {
                if(!IS_PRODUCTION_MODE && UsePackage){
                    library(devtools)
                    install_github("privacytoolsproject/PSI-Library")
                }
                if(!UsePackage){
                    source(file.path(libraryPath, "mechanisms.R"))
                    for (file in list.files(libraryPath)) {
                        source(file.path(libraryPath, file))
                    }
                }
            }
            else {
                install.packages(packageList[i], repos=useRepos)
            }

            require(packageList[i], character.only = TRUE)
        }
    }
    update.packages(ask = FALSE, dependencies = c('Suggests'), oldPkgs=packageList, repos=useRepos)
}

requirePackages <- function(packageList) lapply(packageList, require, character.only = TRUE)

# install(c(packageList.any, packageList.report))
