---
title: "How to Create a Role in Kubernetes"
slug: "how-to-create-a-role-in-kubernetes"
created: 2026-11-23T20:54:00+02:00
updated: 2026-11-23T21:12:40+02:00
category: til
tags: ["k8s", "rbac"]
description: Create a role in Kubernetes
---
To create a [role](/til/role-in-kubernetes) in Kubernetes, there are two ways.

1. Create the role config in yaml, then run `kubectl create -f`
2. Use the command.

```bash

## To create role
kubectl create role pod-reader --verb=get --verb=list --verb=watch --resource=pods

## To create cluster role

kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods
```