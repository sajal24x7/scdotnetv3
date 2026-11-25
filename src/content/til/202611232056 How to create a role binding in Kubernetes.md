---
title: How to Create a Role Binding in Kubernetes
slug: how-to-create-a-role-binding-in-kubernetes
created: 2026-11-23T18:56:00.000Z
updated: 2026-11-23T19:12:23.000Z
category: til
tags:
  - k8s
  - rbac
description: Create a role binding in Kubernetes
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668990424568628'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkxq6oiy2i'
  - 'https://www.threads.com/@sajal24x7/post/DgG2lmEgMwv'
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
