---
title: "ReplicaSets in Kubernetes"
slug: "replicasets-in-kubernetes"
created: 2026-10-15T20:50:00+03:00
updated: 2026-10-15T20:53:42+03:00
category: til
tags: ["k8s"]
---
ReplicaSets are a level up from [Pods in Kubernetes](/pods). They are a type of controller (replication-controller) which we use to ensure a certain number of pods are live.

It is part of `apps/v1` with kind of `ReplicaSet`.

It is different from the previously used ReplicationController in that we need to define a selector in it's definition file.