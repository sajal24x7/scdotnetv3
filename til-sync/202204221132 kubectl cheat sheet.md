---
aliases:
  - kubectl cheat sheet
tags:
  - "#k8s"
category: til
updated: 2026-08-25T14:30:56
---
# Get nodes and IP details
```bash
kubectl get nodes -o wide --no-headers | awk '{ print $1 ,$7}'
```

---
references: