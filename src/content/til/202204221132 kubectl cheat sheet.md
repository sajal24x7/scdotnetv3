---
title: kubectl cheat sheet
slug: kubectl-cheat-sheet
pubDate: '2022-04-22T11:32:00+03:00'
updatedDate: '2022-04-22T11:32:00+03:00'
category: til
tags:
- k8s
---


# Get nodes and IP details
```bash
kubectl get nodes -o wide --no-headers | awk '{ print $1 ,$7}'
```

---
references: