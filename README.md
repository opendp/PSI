# PSI - Private data Sharing Interface

- Reference: https://privacytools.seas.harvard.edu/project-description

To run locally:

1. Using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/), create a virtualenv and install Install dependencies: 

          mkvirtualenv psi
          pip install -r requirements/base.txt

2. Start rook:
  
      In R run: 

            setwd ("[path to.../PSI/rook")
            source ("rookSetup.R")

      Alternatively:

            fab run-rook
            
3. In a separate Terminal, invoke the virtualenv and start Django: 

          workon psi
          python manage.py runserver 8080

      Alternatively:

          workon psi
          fab run-web

Any port other than 8000 can be specified because rook runs on 8000. 

To allow communication with rook, CORS request have to be enabled on your browser:

Enabling CORS request to local files on Chrome:
`google-chrome --disable-web-security --user-data-dir="[path to ../PSI/data]"`

---

## Developers

Please use the following workflow when updating this repository.

1. Create a [GitHub issue](https://github.com/TwoRavens/PSI/issues) or look up the number of an existing issue.
    - Example: Issue #18 is titled "Add external, static files directly to project"
2. [Create a new branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/) off of master based on the issue number. 
    - Naming format for branch: `(issue number)-some-text`
    - example: `18-external-files`
3. Make your updates on the new branch, `18-external-files`
4. After* your changes are made, update your branch (e.g. `18-external-files`) with any new updates on master.  Example:
    ```
    git checkout master            # switch to the master branch
    git pull                       # retrieve updates
    git checkout 18-external-files # switch back to your branch
    git branch                     # make sure you are on your branch
    git merge origin               # bring any changes from master into your branch; resolve any conflicts
    # test your code
    ```
    - *If you are making a change that takes days/weeks, update your branch more frequently.
5. [Create a pull request](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request)
6. Notify @tercer or @jackmurtagh of the pull request
