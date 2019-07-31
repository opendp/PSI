report.app <- function(everything) {
    requirePackages(c(packageList.any, packageList.report))

    if (!dir.exists(RELEASE_OUTPUT_PATH)) dir.create(RELEASE_OUTPUT_PATH, recursive = TRUE)

    hash <- paste0(sample(c(0 : 9, LETTERS), 10, replace = TRUE), collapse = "")
    reportName <- paste0('report_', hash, '.pdf')

    templatePath <- paste(getwd(), 'apps/appReportTemplate.Rmd', sep = "/")
    releasePath <- paste(RELEASE_OUTPUT_PATH, paste0('release_', hash, '.json'), sep = "/")
    reportPath <- paste(RELEASE_OUTPUT_PATH, reportName, sep = "/")
    auxiliaryPath <- paste(RELEASE_OUTPUT_PATH, paste0('report_', hash, '_files'), sep = "/")

    reportParams <- list(
        title = "Differential Privacy Release",
        author = "PSI",
        path = releasePath,
        merge = 'true'
    )

    write(everything$metadata, releasePath)
    rmarkdown::render(
        templatePath,
        params = reportParams,
        output_file = reportPath,
        envir = new.env() # knit in a new R session, to prevent name collisions
    )

    # delete files used to construct the report
    unlink(auxiliaryPath, recursive = TRUE)
    file.remove(releasePath)

    return(jsonlite::toJSON(list(report_url = jsonlite::unbox(reportPath))))
}

# rmarkdown::render('../appReportTemplate.Rmd', params=list(title="myTitle", author="PSI", path='/psi_volume/output/reports/release.json', merge='true'), output_file='/psi_volume/output/reports/report.pdf')
