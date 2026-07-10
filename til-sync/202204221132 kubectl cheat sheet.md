---
tags:
  - k8s
aliases:
category: til
---

# Get nodes and IP details
```bash
kubectl get nodes -o wide --no-headers | awk '{ print $1 ,$7}'
```

---
references: