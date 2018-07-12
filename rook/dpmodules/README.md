
dpmodules
============

subdirectory for DP project modules
-----------------------------------------


This directory contains functional modules written for the Dataverse / Privacy Tools integration.

The modules are functions or sets of functions accessed by a central program (Jack) that interacts with users and modules. 

The functions should be well conceived, and their signatures discussed among the group, as has been done through the design documents.

A function signature contains the name, the input paramters, and the type/class of the return object.

While the contents of the function can change as we improve our code, the signatures should remain the same, this way the central program does not need to be modified as code improves.

-----------------------------------------

Each file for releasing a privacy preserving statistic should contain the following functions:

- *statistic*.release 
Input: eps, data; remainder of arguments dependent on type of statistic
Output: list of two variables, release and params  
release – released statistic  
params – list of the parameters that were passed into the release function (eps, del, etc.), in addition to n (the number of elements in the data), but excluding the data itself.

- *statistic*.getCI  
Input: release, params, alpha=0.05  
Output: list of vectors of upper and lower confidence limits 

- *statistic*.getAccuracy
Input: eps, beta; remainder of arguments dependent on type of statistic
Output: dependent on type of statistic

- *statistic*.getParameters 
Input: n, eps; remainder of arguments dependent on type of statistic 
Output: the epsilon necessary to guarantee the given accuracy