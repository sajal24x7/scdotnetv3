---
title: Take Postgres Dump
slug: take-postgres-dump
created: '2022-06-22T17:37:00+03:00'
updated: '2022-06-22T17:37:00+03:00'
category: til
tags:
  - ccs
  - postgres
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modju673vh2w'
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
