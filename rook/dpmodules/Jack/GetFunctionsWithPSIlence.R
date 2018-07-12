#####################################################
#
#	This code contains the get_accuracies and get_parameters functions
#	which communicate with the other modules to compute accuracy/privacy
#	tradeoffs. Updated 10/20/17 to communicate with PSIlence library.
#
#	Jack Murtagh
#	Harvard University
#	7/20/14
#
###



get_accuracies <- function(metadata, n, Beta){
	# Get a list of accuracy values from the appropriate DP algorithm given all of the
	# individual privacy parameters stored in metadata. 
	
	# Args: 
	#	metadata: a dataframe where each row corresponds to a single call of a DP algorithm 
	#             and contains the relevant information for that call.
	#	n: number of people in the database
	#	Beta: a global parameter that indicates that each of the accuracy values reported will be 
	#         achieved (1 - Beta) percent of the time
	#   statlist: added 10/20/17, vector of statistics available in the library
	#
	# Returns:
	#	vector of accuracy values for each of the k stats being computed.
	
	
	# total number of calls we will make to a DP algorithm.
	k <- length(metadata[ , 1]) 
	
	# Vector that will contain the list of new accuracy values. 
	new_accuracies <- c()     
	
	for(i in 1:k){
		stat <- metadata$Statistic[i]
		new_acc <- NULL 
		eps_i <- as.numeric(metadata$Epsilon[i])    
		del_i <- as.numeric(metadata$Delta[i])

		if(stat %in% statlist){
			# call PSIlence library to get acc
			function_name <- stat_to_func_dict[[stat]]
			mechanism <- stat_to_mech_dict[[stat]]
			t <- metadata$Type[i]
			type <- type_conversion_dict[[t]]
			
			# arguments for every statistic:
			args <- list(mechanism=mechanism, var.type=type, epsilon=eps_i, delta=del_i, alpha=Beta, n=n)
			
			for(key in names(metadata_to_argument_dict)){
				if(key != "Upper_Bound" && key != "Lower_Bound"){
					if(metadata_to_type_dict[[key]]=="numeric"){
						args[metadata_to_argument_dict[[key]]] <- as.numeric(metadata[[key]][i])
					}
					else{
						args[metadata_to_argument_dict[[key]]] <- metadata[[key]][i]
					}
					
					'
					print("adding args")
					save(metadata,file="meta.rda")
					print(metadata_to_argument_dict[[key]])
					print(key)
					print(metadata$key)
					print(i)
					print(metadata$key[i])
'					
				}
			}
			#add range argument manually
			rng <- c(as.numeric(metadata[["Lower_Bound"]][i]), as.numeric(metadata[["Upper_Bound"]][i]))
			args$"rng" <- rng
			#print(function_name)
			f <- get(function_name)$new
			# call library
			#print(f)
			#print(args)
			out <- do.call(f,args=args)
			#print("right here")
			#print(out$accuracy)
			new_acc <- out$accuracy	
		}
		
		#if the statistic in the metadata dataframe is unrecognized. This should only happen if the library and UI are reading different JSON files.
		else{
			return("error")
		}

		# append updated accuracy to the vector that will be returned. 
		# Store everything as characters in case somebody's report of accuracy is not a simple number. 
		print("adding acc:")
		print(new_acc)
		print("for stat")
		print(stat)
		new_accuracies <- c(new_accuracies, as.character(new_acc)) 		
	}
	return(new_accuracies)
} 
#end get_accuracies



#############################




get_parameters <- function(new_accuracy, i, metadata, n, Beta){
	# Get the needed privacy parameter for a specific stat given the user specified accuracy.
	#
	#
	# Args:
	#	new_accuracy: user specified accuracy value.
	#	i: The row number in the metadata dataframe that the user just changed.
	#	metadata: dataframe containing a row for each call to a DP algorithm and all the necessary 
	#             information about that call (see convert function for more information)
	#	n: number of people in the dataset
	#   statlist: added 10/20/17, vector of statistics available in the library
	#	Beta: a global parameter that indicates that each of the accuracy values reported will be 
	#         achieved (1 - Beta) percent of the time
	#
	# Returns:
	#	new_eps: the epsilon_i required by the particular algorithm to ensure new_accuracy
	
	
	# pull together relevant information for the get_parameter calls
	del_i <- as.numeric(metadata$Delta[i])
	stat <- metadata$Statistic[i]
	new_accuracy <- as.numeric(new_accuracy)

	if(stat %in% statlist){
		# call PSIlence using info below
			function_name <- stat_to_func_dict[[stat]]
			mechanism <- stat_to_mech_dict[[stat]]
			t <- metadata$Type[i]
			type <- type_conversion_dict[[t]]
			
			# arguments for every statistic:
			args <- list(mechanism=mechanism, var.type=type, accuracy=new_accuracy, delta=del_i, alpha=Beta, n=n)
			
			for(key in names(metadata_to_argument_dict)){
				if(key != "Upper_Bound" && key != "Lower_Bound"){
					if(metadata_to_type_dict[[key]]=="numeric"){
						args[metadata_to_argument_dict[[key]]] <- as.numeric(metadata[[key]][i])
					}
					else{
						args[metadata_to_argument_dict[[key]]] <- metadata[[key]][i]
					}				
				}
			}
			#add range argument manually
			rng <- c(as.numeric(metadata[["Lower_Bound"]][i]), as.numeric(metadata[["Upper_Bound"]][i]))
			args$"rng" <- rng
			f <- get(function_name)$new
			# call library
			out <- do.call(f,args=args)
			# need to fix range things in library
			new_acc <- out$accuracy

	}
	#if the statistic in the metadata dataframe is unrecognized. This should only happen if the UI and back end are reading different JSONs.
	else{ 
		return("error")
	} 
	'
	# handle each kind of statistic separately:
	if(stat == "mean"){
		range <- abs(as.numeric(metadata$Upper_Bound[i]) - as.numeric(metadata$Lower_Bound[i])) 
		new_eps <- Mean.getParameters(new_accuracy, del_i, range, n, Beta) 
	}

	else if(stat == "quantile"){
		granularity <- as.numeric(metadata$Granularity[i])
		range <- c(as.numeric(metadata$Lower_Bound[i]), as.numeric(metadata$Upper_Bound[i]))
		new_eps <- Quantile.getParameters(new_accuracy, Beta, range, granularity, n) 	
	}

	else if(stat == "cdf"){
		granularity <- as.numeric(metadata$Granularity[i])
		range <- c(as.numeric(metadata$Lower_Bound[i]), as.numeric(metadata$Upper_Bound[i]))
		new_eps <- CDF.getParameters(new_accuracy, Beta, range, granularity, n) 	
	}
	
    else if(stat == "histogram"){
		bins <- as.numeric(metadata$Number_of_Bins[i])
		#new_eps <- histogram$getParameters(bins, n, del_i, new_accuracy, Beta)	
		#with new histogram code: changed 8/8/14
		new_eps <- Histogram.getParameters(TRUE, n, del_i, new_accuracy, Beta) 
	}	
	
	else if(stat == "covariance"){
		upper <- c()
		lower <- c()
		
		#For covariance, getParameters will need a list of upper and lower bounds for each attribute in the matrix
		for(j in 1:length(metadata[ ,1])){
			if(metadata$Covariance[j] == 1){      #if attribute is included in the covariance matrix
				upper <- c(upper, as.numeric(metadata$Upper_Bound[j]))	 #append values to upper and lower bound vectors
				lower <- c(lower, as.numeric(metadata$Lower_Bound[j]))
			}
		}
		new_eps <- VCV.getParameters(new_accuracy, del_i, upper, lower, n, Beta)			
	}
	
'		
	return(new_eps)
	
}

#end get_parameters