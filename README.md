# PSI
Private data Sharing Interface

Enabling CORS request to local files on Chrome:
`google-chrome --disable-web-security --user-data-dir="[path to ..\PrivateZelig\data here]"`


To run locally:

1. Install dependencies: `pip install -r requirements/base.txt`

2. Start rook:

      In R run: 

            `setwd ("[path to psi project]/rook")`

            `source ("rookSetup.R")`

3. Start Django: `python manage.py runserver 8080`

Any port other than 8000 can be specified because rook runs on 8000. 

