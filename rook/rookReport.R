rookReport.app <- function(params, body) {

  body <- gsub("tableJSON=", "", body)

  if (!dir.exists(RELEASE_OUTPUT_PATH))
    dir.create(RELEASE_OUTPUT_PATH, recursive = TRUE)

  reportName <- paste0('report_', paste0(sample(c(0:9, LETTERS), 10, replace=TRUE), collapse=""), '.pdf')

  templatePath <- paste(getwd(), 'rookReportTemplate.Rmd', sep="/")
  releasePath <- paste(RELEASE_OUTPUT_PATH, 'release.json', sep="/")
  reportPath <- paste(RELEASE_OUTPUT_PATH, reportName, sep="/")
  returnPath <- paste('/rook-files', reportName, sep="/")
  
  reportParams <- list(
    title="Differential Privacy Release", 
    author="PSI", 
    path=releasePath,
    merge='true'
  )
  
  write(body, releasePath)
  rmarkdown::render(
    templatePath, 
    params=reportParams, 
    output_file=reportPath,
    envir = new.env() # knit in a new R session, to prevent name collisions
  )
  
  file.remove(releasePath)
  
  list(report_url=jsonlite::unbox(returnPath))
}

# rmarkdown::render('../rookReportTemplate.Rmd', params=list(title="myTitle", author="PSI", path='/home/shoe/PSI/PSI/rook/rook-files/release.json', merge='true'), output_file='/home/shoe/PSI/PSI/rook/rook-files/report.pdf')
