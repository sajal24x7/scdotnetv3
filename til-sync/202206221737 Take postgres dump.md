---
aliases:
  - Take postgres dump
tags:
  - "#ccs"
  - "#postgres"
category: til
updated: 2026-08-25T14:30:56
---
Take a postgres db dump -
Find cloudcenter-shared-postgres pod -
kubectl get pods -n cisco | grep postgres
Get into the pod's shell -
kubectl exec -it -n cisco cloudcenter-shared-postgres-0 -- bash
#pg_dump -U cliqr cliqrdb | gzip > /tmp/<filename>.gz
Exit the pod -
#exit
Copy the dump to the host -
kubectl cp cloudcenter-shared-postgres-0:/tmp/<filename>.gz ~/<filename>.gz 

---
references: