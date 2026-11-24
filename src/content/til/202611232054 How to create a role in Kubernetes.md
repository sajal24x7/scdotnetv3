---
title: How to Create a Role in Kubernetes
slug: how-to-create-a-role-in-kubernetes
created: 2026-11-23T18:54:00.000Z
updated: 2026-11-23T19:12:40.000Z
category: til
tags:
  - k8s
  - rbac
description: Create a role in Kubernetes
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668989701191885'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkxfrfd62l'
  - 'https://www.threads.com/@sajal24x7/post/DgG2kRCAJD3'
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
