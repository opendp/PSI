## This is a configuration file for Rook apps

# ------------------------------------------------
# Use production mode when environment variable
#  ROOK_USE_PRODUCTION_MODE = "yes"
# ------------------------------------------------
IS_PRODUCTION <- identical(Sys.getenv(x='ROOK_USE_PRODUCTION_MODE', unset="no"), "yes")
#print(paste("IS_PRODUCTION: ", IS_PRODUCTION, sep=""))

# ------------------------------------------------
# Set the data directory path
#  and make sure it ends with "/"
# ------------------------------------------------
default_data_directory_path <- paste(dirname(getwd()), "/data/", sep="")
DATA_DIRECTORY_PATH <- Sys.getenv(x='DATA_DIRECTORY_PATH', unset=default_data_directory_path)

# Make sure the path ends with "/"
#
if(substring(DATA_DIRECTORY_PATH, nchar(DATA_DIRECTORY_PATH)) != "/"){
	 DATA_DIRECTORY_PATH <- paste(DATA_DIRECTORY_PATH, "/", sep="")
}
