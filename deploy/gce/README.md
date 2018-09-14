


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
