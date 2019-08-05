##
##  Read in dataset and create skeleton .xml file in the format that Dataverse constructs.
##
##  jh 8/1/19
## 

#install.packages("xml2")
library(foreign)
library(xml2)

rm(list=ls())

xmlDataverseCreate <- function(filename, removelist){

  data <- read.csv(filename)
  print(dim(data))

  print(!(names(data) %in% removelist))


  data <- data[ , !(names(data) %in% removelist)]

  print(names(data))
  print(dim(data))
  print(summary(data))




  # Want to mimic:
  # <dataDscr><var ID="v413" name="&quot;age&quot;" intrvl="discrete">

  allnames <- names(data)

  dataDscr = vector("list", length = ncol(data))
  names(dataDscr) <- rep("var", length(dataDscr))

  for(i in 1:ncol(data)){

    tempvar <- structure(list(), name = allnames[i], intrvl="contin")
    dataDscr[[i]] <- tempvar
  }

  print(dataDscr)

  liststruct <- list(
    codebook = list(
      fileTxt = list(
        fileName = list("Harvard EdX Data")),
      dimensns = list(
        caseQnty = list(nrow(data)),
        varQnty = list(ncol(data))),
      dataDscr = dataDscr
    )
  )


  myxml <- as_xml_document(liststruct)
  print(myxml)

  write_xml(myxml, "output.xml")
  
  #######################
  ## Now build JSON

  k<-length(allnames)
  defaulttypes <- typeGuess(data)
  print(defaulttypes)
  hold<-list()

  for(i in 1:k){
    hold[[i]]<-list(numchar=defaulttypes$defaultNumchar[i], 
      nature=defaulttypes$defaultNature[i], 
      binary=defaulttypes$defaultBinary[i], 
      interval=defaulttypes$defaultInterval[i])
  }

  names(hold)<-allnames

  hold2 <- list(variables=hold)

  jsonHold<-rjson:::toJSON(hold2, indent=1)

  write(jsonHold, file="output.json")


  return(liststruct)

}



## typeGuess() is a function that takes as input a dataset and returns our best guesses at types of variables. numchar is {"numeric" , "character"}, interval is {"continuous" , "discrete"}, nature is {"nominal" , "ordinal" , "interval" , "ratio" , "percent" , "other"}. binary is {"yes" , "no"}. if numchar is "character", then by default interval is "discrete" and nature is "nominal".
typeGuess <- function(data) {

    k <- ncol(data)

    out<-list(varnamesTypes=colnames(data), defaultInterval=as.vector(rep(NA,length.out=k)), defaultNumchar=as.vector(rep(NA,length.out=k)), defaultNature=as.vector(rep(NA,length.out=k)), defaultBinary=as.vector(rep("no",length.out=k)), defaultTime=as.vector(rep("no",length.out=k)))

    numchar.values <- c("numeric", "character")
    interval.values <- c("continuous", "discrete")
    nature.values <- c("nominal", "ordinal", "interval", "ratio", "percent", "other")
    binary.values <- c("yes", "no")
    time.values <- c("yes", "no")


    Decimal <-function(x){
        result <- FALSE
        level <- floor(x)
        if(any(x!=level)) result <- TRUE

        return(result)
    }

    # Nature() takes a column of data x, and a boolean c that is true if x is continuous, and a vector nat that is the values of nature and returns a guess at the nature field
    Nature <- function(x, c, nat) {
        if(c) { # interval is continuous
            if(all(x >=0 & x <=1)) {
                return(nat[5])
            }
            else if(all(x >=0 & x <=100) & min(x) < 15 & max(x) > 85){
                return(nat[5])
            } else {
                return(nat[4]) # ratio is generally the world we're going to be in
            }
        } else { # interval is discrete
            return(nat[2]) # if it is a continuous, discrete number, assume ordinal
        }
    }

    # Time() takes a column of data x and returns "yes" or "no" for whether x is some unit of time
    Time <- function(x){
        # eventually, this should test the variable against known time formats
        return("no")
    }


    for(i in 1:k){

        v<- data[,i]

        # time
        out$defaultTime[i] <- Time(v)

        # if variable is a factor or logical, return character
        if(is.factor(v) | is.logical(v)) {
            out$defaultInterval[i] <- interval.values[2]
            out$defaultNumchar[i] <- numchar.values[2]
            out$defaultNature[i] <- nature.values[1]

            v <- as.character(v)
            v[v=="" | v=="NULL" | v=="NA"]  <- NA
            v <- v[!is.na(v)]

            if(length(unique(v))==2) {out$defaultBinary[i] <- binary.values[1]}
            next
        }

        v <- as.character(v)
        v[v=="" | v=="NULL" | v=="NA"]  <- NA
        v <- v[!is.na(v)]

        # converts to numeric and if any do not convert and become NA, numchar is character
        v <- as.numeric(v)

        if(length(unique(v))==2) {out$defaultBinary[i] <- binary.values[1]} # if there are only two unique values after dropping missing, set binary to "yes"

        if(any(is.na(v))) { # numchar is character
            out$defaultNumchar[i] <- numchar.values[2]
            out$defaultNature[i] <- nature.values[1]
            out$defaultInterval[i] <- interval.values[2]
        } else { # numchar is numeric
            out$defaultNumchar[i] <- numchar.values[1]

            d <- Decimal(v)
            if(d) { # interval is continuous
                out$defaultInterval[i] <- interval.values[1]
                out$defaultNature[i] <- Nature(v,TRUE, nature.values)
            } else { # interval is discrete
                out$defaultInterval[i] <- interval.values[2]
                out$defaultNature[i] <- Nature(v,FALSE, nature.values)
            }
        }
    }

    return(out)
}




## This is the call for Jayshree's OI dataset
# myremovelist <- c("par_state","gender","kid_race")
# test <- xmlDataverseCreate(filename = "simulatedCensus_17.csv", removelist = myremovelist)


### This is the call for edx data
# myremovelist <- c("roles_isFinance", "roles_isLibrary", "roles_isSales", "roles_isAdmin", "roles", "forumRoles_isModerator", "forumRoles_isStudent", "forumRoles_isBetaTester", "forumRoles_isInstructor", "forumRoles_isStaff", "registered")
# test <- xmlDataverseCreate(filename = "hxdata2.csv", removelist=myremovelist)


