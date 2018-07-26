# variation on http://jeffreyhorner.tumblr.com/post/33814488298/deploy-rook-apps-part-ii

source('rookSetup.R')

# Now make the console go to sleep. Of course the web server will still be
# running.
while (TRUE) {
  print('(rook restarts every hour)')
  Sys.sleep(1 * 60 * 60) # restart every hour

  source("rookrestart.R")
}
# If we get here then the web server didn't start up properly
warning("Oops! Couldn't start Rook app")
