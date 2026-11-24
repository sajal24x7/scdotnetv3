---
title: How to Check How Many Roles Exist in a Namespace
slug: how-to-check-how-many-roles-exist-in-a-namespace
created: 2026-11-23T19:13:00.000Z
updated: 2026-11-23T19:14:29.000Z
category: til
tags:
  - k8s
  - rbac
description: Check how many roles exist in a namespace
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668991242913847'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zky47zig2c'
  - 'https://www.threads.com/@sajal24x7/post/DgG2nKwADnZ'
---
To check how many [roles](/til/role-in-kubernetes) exist in a namespace

```bash
kubectl get roles

## To get more detail about a role
kubectl get role <rolename> -o yaml
```
