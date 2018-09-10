## This is a configuration file for Rook apps

# Use production mode if env variable ROOK_USE_PRODUCTION_MODE = "yes"
#
IS_PRODUCTION <- identical(Sys.getenv(x='ROOK_USE_PRODUCTION_MODE', unset="no"), "yes")

#print(paste("IS_PRODUCTION: ", IS_PRODUCTION, sep=""))
