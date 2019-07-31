# PSI deploy on GCE

The commands for this section are for deploying the PSI docker containers on google cloud (GCE), accessible through the url:
  - http://psiprivacy.org

## Updating the `master branch` for deployment

The `master branch` of PSI is the one used to build images for deployment.

The 2 steps below update the `master branch` by merging the latest from the `develop branch`.


#### Step 1

To update the master branch via the command line, run:

```
git checkout develop; git pull  # get latest develop on your machine

git checkout master; git pull   # get latest master on your machine

git branch # make sure you're on master

git merge origin develop  # If this pushes you into the vim editor, do keystrokes: ":wq" + Return button

git push # push it to github
```

#### Step 2

- Go to Travis.  
  - https://www.travis-ci.com/privacytoolsproject/PSI/builds
  
- When Travis finishes, the master image should be updated here:
  - https://hub.docker.com/r/privacytoolsproject/psi-web/tags/

- If you've updated the Flask section, also look for this image to be complete:
  - https://hub.docker.com/r/privacytoolsproject/psi-r-service/tags/
  or check build status here: https://hub.docker.com/r/privacytoolsproject/psi-r-service/builds/
  - Note: This build starts on Docker -- _after_ the (previous build)[https://hub.docker.com/r/privacytoolsproject/psi-web/tags/] is completed


## Docker images

The docker images are being pulled from [hub.docker](https://hub.docker.com/r/privacytoolsproject).  
- In general, docker images are rebuilt (via [Travis](https://www.travis-ci.com/privacytoolsproject/PSI)), whenever code is checked into the `develop` or `master` branches.
- The docker images deployed on gce are from the master branch and tagged as `master`, as in `privacytoolsproject/psi-web:master`, etc.

Docker Image list:

- [privacytoolsproject/psi-web](https://hub.docker.com/r/tworavens/psi-web/tags/)
  - Contains the main web service which routes calls to Flask.
- [privacytoolsproject/psi-r-service](https://hub.docker.com/r/tworavens/psi-r-service/tags/)
  - R applications, including the core PSI code is run here
- [privacytoolsproject/psi-nginx](https://hub.docker.com/r/tworavens/psi-nginx/tags/)
  - In deployment, nginx handles all requests, either sending them to psi-web, or handling static file* requests directly.  (* css, js, etc)


## Deploying

- Go to the [GCE k8s console](https://console.cloud.google.com/kubernetes/list):
  - Click "connect" next to "cluster-1"
    - This will launch an online Terminal window

- To deploy, run the following commands.  
  - Note: if the service is already running, use the "Stop the service" commands first

### Subsequent Deploys

```
cd psi-deploy

# Stop the pod
kubectl delete -f psi-pod-with-svc.yml --grace-period=0 --force

# Start the pod
kubectl apply -f psi-pod-with-svc.yml

```



### Initial Deploy

```
# Make sure you have access to the secrets file
#
# Output will be similar to:
#     NAME              TYPE      DATA      AGE
#     psi-web-secrets   Opaque    1         2h
#
kubectl get secret psi-web-secrets

# Retrieve the latest pod + service configuration file
#    
mkdir psi-deploy
cd psi-deploy
wget https://raw.githubusercontent.com/privacytoolsproject/PSI/master/deploy/gce/psi-pod-with-svc.yml

# Start the service
#
kubectl apply -f psi-pod-with-svc.yml


# Stop the service and pod the correct way -- takes about a minute
#
kubectl delete -f psi-pod-with-svc.yml

# Stop the service immediately
#
kubectl delete -f psi-pod-with-svc.yml --grace-period=0 --force
```

## Viewing logs and accessing running containers

The following commands below may be run in the GCE k8s console.

- Checking status

```
kubectl get pods
kubectl describe pod psi-pod
```

- Viewing logs

```
# Logs
#
kubectl logs psi-pod psi-web
kubectl logs psi-pod psi-flask-service
kubectl logs psi-pod psi-nginx

# To tail a log, add the "-f" option as in:
#
kubectl logs -f psi-pod psi-web
```

- Accessing containers

```
# Log into running container
#
kubectl exec -it psi-pod -c  psi-web /bin/bash
kubectl exec -ti psi-pod -c psi-flask-service /bin/bash
kubectl exec -ti psi-pod -c psi-nginx /bin/bash
```
