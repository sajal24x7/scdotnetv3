---
title: How to Get API Resource Details in Kubernetes
slug: how-to-get-api-resource-details-in-kubernetes
created: 2026-11-23T19:42:00.000Z
updated: 2026-11-23T19:48:39.000Z
category: til
tags:
  - k8s
  - rbac
description: Find details about api-resources
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668992021127921'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkyhi67l2m'
  - 'https://www.threads.com/@sajal24x7/post/DgG2olOABcy'
---
```bash

# To check if resource is namespaced or not
# Useful when deciding whether to create a role or clusterrole
kubectl api-resources --namespaced=false
kubectl api-resources --namespaced=true # this is also default

```

The api version which is the output of this command specifies whether resource is core resource (as "" in [role](/til/role-in-kubernetes) definition for example) or not. V1 is core api-resource. Others need to be specified.

```bash
k api-resources | grep deploy
deployments                         deploy       apps/v1                           true         Deployment
```
