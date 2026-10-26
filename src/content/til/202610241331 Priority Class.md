---
title: Priority Class
slug: priority-class
created: 2026-10-24T10:31:00.000Z
updated: 2026-10-24T10:41:34.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117496695109507258'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myn2iva2zi2y'
  - 'https://www.threads.com/@sajal24x7/post/De4gIiklBEl'
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
