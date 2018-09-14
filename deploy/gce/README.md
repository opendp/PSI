# Shortcuts for PSI deploy


- Go to the GCE k8s console:
  - https://console.cloud.google.com/kubernetes/list
  - Click "connect" next to "cluster-1"
    - This will launch an online Terminal window

```
# Go to the PSI directory
#
cd PSI/deploy/gce

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

```
# Logs
#
kubectl logs psi-pod psi-web
kubectl logs psi-pod psi-rook-service
kubectl logs psi-pod ravens-nginx

# Log into running container
#
kubectl exec -it psi-pod -c  psi-web /bin/bash
kubectl exec -ti  psi-pod -c psi-rook-service /bin/bash
kubectl exec -ti  psi-pod -c ravens-nginx /bin/bash
```
