# PSI
Private data Sharing Interface

To run locally:

1. Install dependencies: `pip install -r requirements/base.txt`

2. Start rook:

      In R run: 

            setwd ("[path to.../PSI/rook")

            source ("rookSetup.R")

3. Start Django: `python manage.py runserver 8080`

Any port other than 8000 can be specified because rook runs on 8000. 

To allow communication with rook, CORS request have to be enabled on your browser:

Enabling CORS request to local files on Chrome:
`google-chrome --disable-web-security --user-data-dir="[path to ../PSI/data]"`

