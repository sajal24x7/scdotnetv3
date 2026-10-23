---
title: "How to Label Nodes in Kubernetes"
slug: "how-to-label-nodes-in-kubernetes"
created: 2026-10-22T22:48:00+03:00
updated: 2026-10-22T22:54:52+03:00
category: til
tags: ["k8s"]
---
To label nodes in Kubernets:

```shell
kubectl label node <node-name> <key>=<value>

## Example
kubectl label node node01 size=large

```

Why do we use this? In scenarios where we want to use for example `nodeSelector` with [pods](/til/pods) to specify where it may be able to run. 