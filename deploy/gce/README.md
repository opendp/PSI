# PSI deploy on GCE

The commands for this section are for deploying the PSI docker containers on google cloud (GCE), accessible through the url:
  - http://psiprivacy.org


## Docker images

The docker images are being pulled from [hub.docker](https://hub.docker.com/r/tworavens).  
  - In general, dockedr images are rebuilt (via [Travis](https://www.travis-ci.com/TwoRavens/PSI)), whenever code is checked into the `develop` or `master` branches.
  - The docker images deployed on gce are from the master branch and tagged as `master`, as in `tworavens/psi-web:master`, etc.


- [tworavens/psi-web](https://hub.docker.com/r/tworavens/psi-web/tags/)
  - Contains the main web service which routes calls to rook.
- [tworavens/psi-r-service](https://hub.docker.com/r/tworavens/psi-r-service/tags/)
  - Rook applications, including the core PSI code is run here
- [tworavens/psi-nginx](https://hub.docker.com/r/tworavens/psi-nginx/tags/)
  - In deployment, nginx handles all requests, either sending them to psi-web, or handling static file* requests directly.  (* css, js, etc)


## Deploying

- Go to the [GCE k8s console](https://console.cloud.google.com/kubernetes/list):
  - Click "connect" next to "cluster-1"
    - This will launch an online Terminal window

- To deploy, run the following commands.  
  - Note: if the service is already running, use the "Stop the service" commands first

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
wget https://raw.githubusercontent.com/TwoRavens/PSI/master/deploy/gce/psi-pod-with-svc.yml

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

- Viewing logs

```
# Logs
#
kubectl logs psi-pod psi-web
kubectl logs psi-pod psi-rook-service
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
kubectl exec -ti psi-pod -c psi-rook-service /bin/bash
kubectl exec -ti psi-pod -c psi-nginx /bin/bash
```
