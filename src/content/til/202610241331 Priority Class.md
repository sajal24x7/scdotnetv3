---
title: "Priority Class"
slug: "priority-class"
created: 2026-10-24T13:31:00+03:00
updated: 2026-10-24T13:41:34+03:00
category: til
tags: ["k8s"]
---
It is a cluster-wide object part of `scheduling.k8s.io/v1`. It has a mapping of priority class name and an integer value. Higher value has higher priority. 

Kubernetes ships with a few default ones, examples below:

```bash
kubectl get priorityClass
NAME                      VALUE        GLOBAL-DEFAULT   AGE   PREEMPTIONPOLICY
system-cluster-critical   2000000000   false            28m   PreemptLowerPriority
system-node-critical      2000001000   false            28m   PreemptLowerPriority
```

## Example

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description: "This priority class should be used for XYZ service pods only."
```
