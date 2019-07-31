##
## appTransform.R
##
## 6/27/15
##
## Michael LoPiccolo
##

# Check if the haskell transform executable exists
#
doesTransformExecutableExist <- function() {
    return (file.exists(TRANSFORM_HASKELL_APP_PATH))
}

getTransformAppNotFoundErrorMessage <- function(){
  if (doesTransformExecutableExist()){
    errMsg <- "Do call this method without first checking 'doesTransformExecutableExist()' (transform.R)"
    return (errMsg);
  }
  errMsg <- paste("The tranformer app was not found at location: ", TRANSFORM_HASKELL_APP_PATH, sep="")
  return (errMsg)
}

getPossibleIncompatibleExecutableError <- function(){

  errMsg = paste("Could not run the executable.  Was it compiled on the same system where its being run?  (Default executable built on debian, doesn't run on OS X).  Executable location: ", TRANSFORM_HASKELL_APP_PATH, sep="")

  return (list("success"=TRUE, "message"=errMsg));

}


verifyTransform <- function(formula, names) {
    ret <- list("success"=TRUE, "message"="msg")

    if(grepl("\n", formula) || grepl("\r", formula)) {
        ret$success = FALSE
        ret$message = "Please strip newlines from your transformation - to separate assignments, just use semicolons"
    } else if (!doesTransformExecutableExist()){
        ret$success = FALSE
        ret$message = getTransformAppNotFoundErrorMessage()

    }else {
        result <- transformExec(formula, names)

        if (is.character(result) && length(result) && (!is.na(result))){
          print('check 1 ...')
          phraseToCheck <- "cannot execute binary file"
          if (grepl(phraseToCheck, result)){
            print('check 2 ...')
            return (getPossibleIncompatibleExecutableError());
          }
        }else{
          return (getPossibleIncompatibleExecutableError());
        }

        if(!succeeded(result)) {
            ret$success = FALSE
            ret$message = result
        }
    }

    return(ret)
}

applyTransform <- function(formula, df) {

  if (!doesTransformExecutableExist()){
      ret <- list("success"=FALSE, "message"=getTransformAppNotFoundErrorMessage())
      return (ret);
  }

  transformInterimResult = transformExec(formula, names(df), frameToString(df))
  if (grepl("cannot execute binary file", transformInterimResult)){
    ret$success = FALSE
    ret$message = paste("Could not run the executable.  Was it compiled on the same system where its being run?  (Default executable built on debian, doesn't run on OS X).  Executable location: ", TRANSFORM_HASKELL_APP_PATH, sep="")
    return (ret);
  }

    ans <- stringToFrame(transformInterimResult)
    if(dim(ans)[1] != dim(df)[1]) {
        # This might be because system2 decided to split input lines - they threaten to do it in the help file?
        # I've read the code (src/unix/sys-unix.c) and it LOOKS like, on any system with getline(), it won't split the input... Tested on my system and it doesn't split every 8095 characters like it threatened...
        return(list("success"=FALSE, "message"="There was a mismatch in the number of rows between the transformation and the result!"))
    }
    return(list("data"=ans));
}

# It should be evident that all of these operations are quite inefficient, due to R not having consistent support for many tools which would have been useful (especially, pipes.)
# If there's time, they could be improved. It's most important, though, that they are trustworthy.

# Things that could be done:
# Reduce the number of times we coerce to/from strings
# Don't send unused data back and forth with transformeR

collapseTabs <- function (a) {return (paste(a, collapse="\t"))}
collapseLinewise <- function (a) {return (paste(a, collapse="\n"))}

# TODO Allow things to return a critical failure?
frameToString <- function(df) {
    return(collapseLinewise(apply(df, 1, collapseTabs)))
}

stringToFrame <- function(str) {
    #writeLines(paste("stringToFrame got:", str, collapse="\n"))
    return(read.table(textConnection(str), sep="\t", header=TRUE, colClasses="character"))
}


# TODO We might want to put this under a timeout constraint.
transformExec <- function (formula, names, rows=NA) {

    inp = paste(formula, "\n", paste(names, collapse=' '))
    if(!is.na(rows)) {
        inp = paste(inp, rows, sep="\n")
    }


    # TODO Change this once we have a system and a location to install transformeR!
    # I won't be adding the actual executable to the git repo. On my system I just set up a quick symbolic link but will need to change that
    # TODO If there ever is an exception thrown from this, we should probably log it and maybe throw a kill switch until we can diagnose the problem.
    return(system2(TRANSFORM_HASKELL_APP_PATH, input=inp, stdout=TRUE, stderr=TRUE))
    #return(system2("../../transformer/transformer-exe", input=inp, stdout=TRUE))
}

succeeded <- function (execResult) {
    return(is.null(attr(execResult, "status")))
}


# I'd like to use pipes instead of system2 to try to prevent buffering
# TODO R is being unfriendly, so it's probably not worth trying to get this working - just use system2 calls

# # uniquename will be concatenated with the process ID to name the pipe,
# # so just make sure uniquename is not used twice in the same process.
# openNamedPipe <- function(uniquename, executable, path=".") {
#     if(!capabilities("fifo")) {
#         stop("appTransform.R: Fifo not supported, are you running Windows?")
#     }
#     pid <- Sys.getpid()

#     # will look like "verifyrun-transformer-tmp-38023"
#     filename <- paste(uniquename, executable, "tmp", pid, sep="-")
#     fullpath <- paste(path, filename, sep=.Platform$file.sep)

#     # TODO Before this, rm the path?
#     print(paste("appTransform.R: Running `mkfifo ", fullpath, "`", sep=""))
#     code <- system2("mkfifo", args=c(fullpath))
#     if(code != 0) {
#         stop(paste("appTransform.R: Fifo could not be created, error code", code))
#     }

#     # TODO I could check to see if the executable exists, but I don't know how to guarantee that this command is actually running correctly, it still opens the pipe when it fails.
#     pipe_in <- pipe(paste(executable, " > ", fullpath, "", sep=""), open="w")
#     pipe_out <- fifo(fullpath, open="r", blocking=TRUE)

#     return(list(output=pipe_out, input=pipe_in))
# }

# # closeNamedPipe <- function(uniquename, executable, path=".")
