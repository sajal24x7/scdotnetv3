---
title: "How to Check If User Has Permission to Do Something in Kubernetes"
slug: "how-to-check-if-user-has-permission-to-do-something-in-kubernetes"
created: 2026-11-23T20:48:00+02:00
updated: 2026-11-23T21:13:08+02:00
category: til
tags: ["k8s", "rbac"]
description: Check if user has permission to do something in Kubernetes
---
You can check what [role](/til/role-in-kubernetes) a user has/related to [RBAC in Kubernetes](/til/rbac-in-kubernetes).

You can run the command with `--as <user>`

```bash
## To check if user can list pods

kubectl get pods --as devuser
```