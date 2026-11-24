---
title: How to Check If User Has Permission to Do Something in Kubernetes
slug: how-to-check-if-user-has-permission-to-do-something-in-kubernetes
created: 2026-11-23T18:48:00.000Z
updated: 2026-11-23T19:13:08.000Z
category: til
tags:
  - k8s
  - rbac
description: Check if user has permission to do something in Kubernetes
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668988889600022'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkwzqkvq2o'
  - 'https://www.threads.com/@sajal24x7/post/DgG2ivNgB1e'
---
You can check what [role](/til/role-in-kubernetes) a user has/related to [RBAC in Kubernetes](/til/rbac-in-kubernetes).

You can run the command with `--as <user>`

```bash
## To check if user can list pods

kubectl get pods --as devuser
```
