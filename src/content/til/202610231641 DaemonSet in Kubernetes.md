---
title: "DaemonSet in Kubernetes"
slug: "daemonset-in-kubernetes"
created: 2026-10-23T16:41:00+03:00
updated: 2026-10-23T16:44:26+03:00
category: til
tags: ["k8s"]
---
DaemonSets allow a copy of a pod to run on all nodes. These are useful when the pod you want to run provides some critical functionality like networking - cilium, for example, or some monitoring component, etc.

They are defined similar to [ReplicaSets](/til/replicasets-in-kubernetes), with `apps/v1` and type of `DaemonSet`.
