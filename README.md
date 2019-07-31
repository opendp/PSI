# PSI - Private data Sharing Interface

This is a repository for the frontend, backend, and cloud deployment of the PSI system.  For the R library of algorithms, see the repository PSI-Library.

- Deployment: http://psiprivacy.org/about
- Reference: https://privacytools.seas.harvard.edu/project-description
- System Paper: https://arxiv.org/abs/1609.04340

To run locally:

1. Using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.io/en/latest/), create a virtualenv and install Install dependencies:

          mkvirtualenv psi
          pip install -r requirements/base.txt

2. Start flask:

      In the Terminal, run:
        
          # Note: To point to a local Haskell transform executable, use a line similar to
          # export TRANSFORM_HASKELL_APP_PATH=/Users/Documents/Github/PrivateZelig/transformer/transformer-exe
          # Note: To run on a different port, pass a --port=8001 argument 
          fab run-flask


3. In a separate Terminal, invoke the virtualenv and start Django:

          workon psi
          fab run-web

      Alternatively:

          workon psi
          python manage.py check
          python manage.py migrate
          python manage.py runserver 8080

Any port other than 8000 can be specified because flask runs on 8000.

To allow communication with Flask, CORS request have to be enabled on your browser:

Enabling CORS request to local files on Chrome:
`google-chrome --disable-web-security --user-data-dir="[path to ../PSI/data]"`

Then PSI page can be brought up as:
http://localhost:8080

---

## Developer Workflow

For any changes to his repository, please use the following workflow:

1. Create a [GitHub issue](https://github.com/TwoRavens/PSI/issues) describing your update.  Alternativley, look up the number of an existing issue.
    - Example: Issue #18 is titled "Add external, static files directly to project"
2. Using the `issue number`, [create a new branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/) off of the main development branch (currently master)
    - Naming format for new branch: `(issue number)-some-text`
    - Example: `18-external-files`
3. Make your updates on the new branch, `18-external-files`
4. After* your changes are made, update the new branch (e.g. `18-external-files`) with any updates on the main development branch (currently master).  Example:
    ```
    git checkout master            # switch to the main development branch
    git pull                       # retrieve updates from the main development branch
    git checkout 18-external-files # switch back to your branch
    git branch                     # sanity check: make sure you are on your branch
    git merge origin               # bring any changes from the main development branch into your branch; resolve any conflicts
    # test your code
    ```
    - *If you are making a change that takes days/weeks, update your branch more frequently.
5. [Create a pull request](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request)
6. Notify @tercer or @jackmurtagh of the pull request
