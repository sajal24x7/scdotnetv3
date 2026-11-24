---
title: RBAC in Kubernetes
slug: rbac-in-kubernetes
created: 2026-11-23T18:29:00.000Z
updated: 2026-11-23T19:13:26.000Z
category: til
tags:
  - k8s
  - rbac
description: Role based access control in k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668986971901534'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkw5zfc62c'
---
To enable RBAC, api server needs to be started with RBAC in `--authorization-mode` setting. You can check this by getting the kube-apiserver pod and checking this setting. 

The API declares four types of objects: Role, ClusterRole, RoleBinding and ClusterRoleBinding.
