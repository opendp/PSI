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
  hist(data$par_county)



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
        fileName = list("simulated census 17")),
      dimensns = list(
        caseQnty = list(nrow(data)),
        varQnty = list(ncol(data))),
      dataDscr = dataDscr
    )
  )


  myxml <- as_xml_document(liststruct)
  print(myxml)

  write_xml(myxml, "output.xml")

  return(liststruct)

}

## This is the call for Jayshree's OI dataset
# myremovelist <- c("par_state","gender","kid_race")
# test <- xmlDataverseCreate(filename = "simulatedCensus_17.csv", removelist = myremovelist)

### This is the call for edx data
# myremovelist <- c("roles_isFinance", "roles_isLibrary", "roles_isSales", "roles_isAdmin", "roles", "forumRoles_isModerator", "forumRoles_isStudent", "forumRoles_isBetaTester", "forumRoles_isInstructor", "forumRoles_isStaff", "registered")
# test <- xmlDataverseCreate(filename = "hxdata.csv", removelist=myremovelist")



