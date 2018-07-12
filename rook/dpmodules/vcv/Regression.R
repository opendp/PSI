D# Regression.R
# Author: Connor Bain - University of South Carolina
# Summer 2014 REU - Harvard University

## Main Function ###############################################################

### Necessary Input ###
  #  X, a vector of x-variables
  #  Y, a scalar value for the y-variable
  #  release, a 2nd moment matrix
###
DTD <- release

# Remove any x variables we're not regressing on
not_X <- NULL
for (i in (ncol(DTD)):1) {
	if (!(i %in% X)) {
		DTD <- DTD[-i, -i]
		not_X <- append(not_X, -i)
	}
}

# Grab the Y column of the release and the sum of the squares (Y.Y)
Y.DTD <- release[not_X, Y]
Y.Y <- release[Y, Y]

# Display the regression we're running
theNames <- row.names(DTD)
source("FixDTD.R")

tryCatch( {
  DTD_inv <- solve(DTD)
}, 
error = function(cond) {
	        cat("Using pseudo inverse.\n")
            #pseudoInd <- rbind(pseduoInd, c(n, i))
            pseudo <- diag(eigen(DTD)$values)
            for (i in 1:ncol(pseudo)) {
            	if (pseudo[i, i] != 0) {
            		pseudo[i, i] <- pseudo[i, i]^(-1)
            	}
            }
            DTD_inv <<- eigen(DTD)$vectors %*% pseudo %*% t(eigen(DTD)$vectors)   
        }
)
#cat("Estimating a linear model:\n")

# for (i in 1:nrow(DTD)) {
	# if (i == 1) {
		# cat(Y, " ~ ")
	# }
	# if (i %in% X) {
		# cat(theNames[i], ", ")
	# }
# }
#cat("\n")
# Solve for Beta (the intercepts) using D^T D
beta <- DTD_inv %*% as.matrix(Y.DTD)

# Solve for the RSS(Beta) error using D^T D 
S <- Y.Y - 2*(t(beta) %*% as.matrix(Y.DTD)) + (t(beta) %*% DTD %*% beta) 
s2 <- S / (nrow(mydata) - (length(X)))

if (s2 <= 0) {
	
	s2 <- 0.001
	cat("FLAG\n")
}

# Calculate the standard error for each coefficient prediction
temp <- NULL
for (i in 1:nrow(DTD_inv)) {
	
	temp <- append(temp, sqrt(DTD_inv[i,i] * as.numeric(s2)))
}
stderror <- matrix(temp, nrow = length(beta), ncol = 1)

# Calculate the t-value for each coefficient prediction
temp <- NULL
for (i in 1:length(beta)) {
	
	temp <- append(temp, beta[i,1]/stderror[i,1])
}
t <- matrix(temp, nrow=length(beta), ncol=1)

# Calculate the probability of each t-value
temp <- NULL
for (i in 1:length(beta)) {
	
	temp <- append(temp, 2*pt(-abs(t[i]), df = nrow(mydata) - length(beta)))
}
Pr <- matrix(temp, nrow=length(beta), ncol=1)

# Assign each coefficient a statistical significance code
temp <- NULL
for (i in 1:length(beta)) {
	tempCode <- NULL
	
	if(Pr[i] < 0.001) {
	  tempCode <- "***"
	}
	else if(Pr[i] < 0.01) {
	  tempCode <- "**"

	}
	else if(Pr[i] < 0.05) {
	  tempCode <- "*"

	}
	else if(Pr[i] < 0.1) {
	  tempCode <- "."

	}
	else {
	  tempCode <- " "

	}
	temp <- append(temp, tempCode)
}
code <- matrix(temp, nrow=length(beta), ncol=1)

# This is just so our output matches lm
fix <- length(beta)

printString <- NULL
#priPrint the results of the regression

for (i in 1:length(beta)) {
	
	 beta[i] <- round(beta[i, 1], digits = 4)
	 stderror[i] <- round(stderror[i, 1], digits = 4)
	 t[i] <- round(t[i, 1], digits = 4)
	 Pr[i] <- round(Pr[i, 1], digits = 4)
 }

printString <- t(as.matrix(c(" ", "Estimate", "Std. Error", "t value", "Pr(>|t|)", " sig code "), ncol=6))

for (i in 1:length(beta)) {
	
	printRow <- as.matrix(c(theNames[i],  beta[i, 1], stderror[i, 1], t[i, 1], Pr[i, 1], code[i, 1]))
	printString <- rbind(printString, t(printRow))
}

#cat("S(beta): ", S, "\n")
#cat("s2: ", s2, "\n")