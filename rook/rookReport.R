rookReport.app <- function(params, body) {

  if (!dir.exists(RELEASE_OUTPUT_PATH))
    dir.create(RELEASE_OUTPUT_PATH, recursive = TRUE)

  templatePath <- paste(getwd(), 'rookReportTemplate.Rmd', sep="/")
  releasePath <- paste(RELEASE_OUTPUT_PATH, 'release.json', sep="/")
  reportPath <- paste(RELEASE_OUTPUT_PATH, 'report.pdf', sep="/")
  returnPath <- '/rook-files/rook-files/report.pdf'
  
  reportParams <- list(
    title="Differential Privacy Release", 
    author="PSI", 
    path=releasePath,
    merge='true'
  )
  
  write(jsonlite::toJSON(body), releasePath)
  rmarkdown::render(
    templatePath, 
    params=reportParams, 
    output_file=reportPath,
    envir = new.env() # knit in a new R session, to prevent name collisions
  )
  
  file.remove(releasePath)
  
  list(report_url=jsonlite::unbox(returnPath))
}
