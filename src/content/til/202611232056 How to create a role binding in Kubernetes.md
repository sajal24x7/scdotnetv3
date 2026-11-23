---
title: "How to Create a Role Binding in Kubernetes"
slug: "how-to-create-a-role-binding-in-kubernetes"
created: 2026-11-23T20:56:00+02:00
updated: 2026-11-23T21:12:23+02:00
category: til
tags: ["k8s", "rbac"]
description: Create a role binding in Kubernetes
---
There are two ways to create a [RoleBinding](/til/rolebinding-in-kubernetes):

1. Create a definition in yaml and then `kubectl create -f`
2. Use commands.

```bash

# To create rolebinding
kubectl create rolebinding bob-admin-binding --clusterrole=admin --user=bob --namespace=acme


## To create clusterrolebinding
kubectl create clusterrolebinding root-cluster-admin-binding --clusterrole=cluster-admin --user=root
```