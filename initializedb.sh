cd /home/jkaashoek/Documents/PSI/test_setup_local

sqlite3 psi_database.db3 "insert into content_pages_dataset (title,description,creators,json_file,xml_file) values "\
"('California Demographics','Data set containing demographics of California','Creator1','preprocess_4_v1-0.json', 'pumsmetaui.xml');"
