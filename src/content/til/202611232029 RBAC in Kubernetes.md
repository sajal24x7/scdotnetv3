---
title: "RBAC in Kubernetes"
slug: "rbac-in-kubernetes"
created: 2026-11-23T20:29:00+02:00
updated: 2026-11-23T21:13:26+02:00
category: til
tags: ["k8s", "rbac"]
description: Role based access control in k8s
---
To enable RBAC, api server needs to be started with RBAC in `--authorization-mode` setting. You can check this by getting the kube-apiserver pod and checking this setting. 

The API declares four types of objects: Role, ClusterRole, RoleBinding and ClusterRoleBinding.
