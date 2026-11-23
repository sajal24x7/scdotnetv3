---
title: "How to Check How Many Roles Exist in a Namespace"
slug: "how-to-check-how-many-roles-exist-in-a-namespace"
created: 2026-11-23T21:13:00+02:00
updated: 2026-11-23T21:14:29+02:00
category: til
tags: ["k8s", "rbac"]
description: Check how many roles exist in a namespace
---
To check how many [roles](/til/role-in-kubernetes) exist in a namespace

```bash
kubectl get roles

## To get more detail about a role
kubectl get role <rolename> -o yaml
```