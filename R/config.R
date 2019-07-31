# ------------------------------------------------
# This is a configuration file for r apps
# ------------------------------------------------

# Make sure there's a backslash at the end
#
add_backslash <- function(str_val){
	if(substring(str_val, nchar(str_val)) != "/"){
		 str_val <- paste(str_val, "/", sep="")
	}
	return(str_val)
}

# ------------------------------------------------
# Set: IS_PRODUCTION_MODE
#  Use production mode when environment variable
#    IS_PRODUCTION_MODE = "yes"
# ------------------------------------------------
IS_PRODUCTION_MODE <- identical(Sys.getenv(x='IS_PRODUCTION_MODE', unset="no"), "yes")
#print(paste("IS_PRODUCTION_MODE: ", IS_PRODUCTION_MODE, sep=""))

# ------------------------------------------------
# Set: TRANSFORM_HASKELL_APP_PATH
#  Optional: Path to the Haskell transform executable--including the executable
#	 e.g. /var/webapps/PSI/R/transformer_app/transformer-exe
# ------------------------------------------------
default_transform_app_path <- paste(getwd(), "/transformer_app/transformer-exe", sep="")
TRANSFORM_HASKELL_APP_PATH <- Sys.getenv(x='TRANSFORM_HASKELL_APP_PATH', unset=default_transform_app_path)

# ------------------------------------------------
# Set: PSI_DATA_DIRECTORY_PATH
#  The data directory path--make sure it ends with "/"
# ------------------------------------------------
default_data_directory_path <- paste(dirname(getwd()), "/data/", sep="")
PSI_DATA_DIRECTORY_PATH <- Sys.getenv(x='PSI_DATA_DIRECTORY_PATH', unset=default_data_directory_path)
PSI_DATA_DIRECTORY_PATH <- add_backslash(PSI_DATA_DIRECTORY_PATH)

# ------------------------------------------------
# Set: DATAVERSE_FILE_ACCESS_URL
#  - Make sure it ends with "/"
# ------------------------------------------------
default_file_access_url <- "https://psi.hmdc.harvard.edu/api/access/datafile/"
DATAVERSE_FILE_ACCESS_URL <- Sys.getenv(x='DATAVERSE_FILE_ACCESS_URL', unset=default_file_access_url)
DATAVERSE_FILE_ACCESS_URL <- add_backslash(DATAVERSE_FILE_ACCESS_URL)
if (nchar(DATAVERSE_FILE_ACCESS_URL)==1){
	stop(paste('DATAVERSE_FILE_ACCESS_URL not set.  Example value: "', default_file_access_url, '"', sep=''))
}

# ------------------------------------------------
# Set: DATAVERSE_FILE_ACCESS_URL
#  - Make sure it ends with "/"
# ------------------------------------------------
default_output_path <- paste("/psi_volume/reports/", sep="")
RELEASE_OUTPUT_PATH <- Sys.getenv(x='RELEASE_OUTPUT_PATH', unset=default_output_path)