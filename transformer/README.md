### TransformeR

You'll need to install stack. Easiest way is `curl -sSL https://get.haskellstack.org/ | sh`, then run `stack update`.

Then, run `./install.sh` to create the initial transformer-exe file. If you'd like to create it in a different location, run `./install.sh <location>`. This executable will be called by system2 calls in R: see dpmodules/Jack/transform.R. Whenever you change the Haskell code, you can run install.sh. (It's just a shortcut for a couple stack commands.)

I personally would just move the binary into your /usr/bin, and instead of using the relative path "../../transformer/transformer-exe", just "transformer". However it is how it is now so you don't need an installer.

A note that you probably won't run into: Stack requires a lot of memory to run first-time setup. I tried to run it on my tiny server and it kept crashing until I created a swap file.

### Interface

Once you have transformer-exe, you can communicate with it using standard output/input.

The first line is the transformation formula (semicolon-separated), and the rest is the database. It should look like an R data frame, so the first line is all the variable names, then the rest of the lines are all the rows of the database.

For explanations of the weird things about TransformeR, see my final report, or my final slides for a quick overview.

### Tutorial (to be included on the budgeter page:)

# Basic tutorial, available operations

This tool allows you to apply R-like transformations to the database before running statistics.

Transformations have the form `my_new_variable_name <- <some formula>`.

For example, you could take the log of a variable: `log_income <- log(income)`  
Take the sum of multiple variables: `total <- profits + losses`  
Use results of transformations in later ones (EXPERIMENTAL): `shifted_log_income <- log_income + 10`  
Use R-like ifelse expressions: `canDrink <- ifelse(country == “United States”, age >= 21, age >= 18)`  
Do NA coercion: `ageDefault30 <- ifelse(is.na(age), age, 30`  
If you prefer, use `=` instead of `<-`: `log_income = log(income`  
More math: `base ** exponent`, equivalently `base ^ exponent`, `sqrt(x)`, `exp(x)`, `log(x)` (natural log), `log(x, base)`.  
Comparisons: `==, !=` (work for strings), `<, >, <=, >=` (do not work for strings)  
Boolean logic: `&&, ||` or equivalently `&, |`.  
Type coercion: `as.numerical(x), as.logical(x), as.categorical(x)` or equivalently `as.character(x)`  

Just like R, we always try to coerce types to do the most logical thing.
For example, `3.4 * TRUE` is `3.4`, `3.4 * FALSE` is `0.0`.

# How TransformeR differs from R:

We don't have support yet for type declarations - TransformeR essentially processes everything as a string right now. This will cause a couple weird cases if you have strings which can also be interpreted as numeric/booleans/NA.
For example, `x == y` evaluates to `TRUE` when x is `"TRUE"` and y is `"1"`. You could fix that with `as.categorical(x) == as.categorical(y)`. Also, strings reading `"NA"` will be interpreted as NA.

# How TransformeR differs from R:
The type system is a little looser than R's, because wo don't know the real type of anything. Be aware that you might not be able to count on getting NA's. `"3" * "2" = 6` in TransformeR.
