##
## appTransform.R
##
## 6/27/15
##
## Michael LoPiccolo
##

# After the user enters a new transformation formula, let them know whether it's valid.
# May consider returning a good name for the variable (instead of letting the user create it)

# TODO put a size limit on the formula we accept
verifyTransform.app <- function(everything) {
    requirePackages(c(packageList.any, packageList.report))

    if(IS_PRODUCTION_MODE) {
        sink(file = stderr(), type = "output")
    }

    print ("Entered transformAdd app")
    # print (system2("pwd", stdout=TRUE))

    warning <- FALSE
    message <- "nothing"

    if(is.null(everything$formula)) {
        warning <- TRUE
        message = "No formula found in request."
    }
    if(is.null(everything$names)) {
        warning <- TRUE
        message = "No variable names found in request."
    }
    else {
        answer <- verifyTransform(everything$formula, everything$names)
        if(!answer$success) {
            warning <- TRUE
            message <- paste("Parser error:", paste(answer$message, collapse='\n'))
        }
    }

    if(!warning) {
        toSend <- list(success=TRUE, message="The transform is verified.")
    }
    else {
        toSend <- list(success=FALSE, message=message, "warning"=message)
    }

    result <- jsonlite:::toJSON(toSend)

    # print("transformAdd: sending JSON:")
    # print(result)
    cat("\n")
    if(IS_PRODUCTION_MODE) {
        sink()
    }

    return(result)
}
