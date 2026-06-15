---
title: Kubectl Cheat Sheet
slug: kubectl-cheat-sheet
created: '2022-04-22T11:32:00+03:00'
updated: '2022-04-22T11:32:00+03:00'
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnd6yqu2o'
---


# Get nodes and IP details
```bash
kubectl get nodes -o wide --no-headers | awk '{ print $1 ,$7}'
```

---
references:
