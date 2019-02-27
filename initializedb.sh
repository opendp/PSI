cd /home/jkaashoek/Documents/PSI/test_setup_local

sqlite3 psi_database.db3 "insert into content_pages_dataset (title,description,creators,file_name,permission) values "\
"('California Demographics','Data set containing demographics of California','Creator1','California Demographic Dataset.csv');"
