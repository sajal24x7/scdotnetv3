---
title: "How to Taint Nodes in Kubernetes"
slug: "how-to-taint-nodes-in-kubernetes"
created: 2026-10-21T15:08:00+03:00
updated: 2026-10-22T22:56:37+03:00
category: til
tags: ["k8s"]
---
Use the `taint` command.

```
kubectl taint nodes node01 key=value:NoSchedule
```