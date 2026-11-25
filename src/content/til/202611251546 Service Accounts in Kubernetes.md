---
title: "Service Accounts in Kubernetes"
slug: "service-accounts-in-kubernetes"
created: 2026-11-25T15:46:00+02:00
updated: 2026-11-25T15:58:28+02:00
category: til
tags: ["k8s", "rbac", "security"]
description:
---
Service accounts are [namespaced](/how-to-get-api-resource-details-in-kubernetes), non-human accounts.

Kubernetes automatically creates a `default` service account for all [namespaces](/namespaces-in-kubernetes) in cluster. It is attached to all pods by default.

To attach a service account to a pod, use the `serviceAccountName` field.

When a service account is attached to a pod, Kubernetes:
1. Automatically creates a token and mounts it as a projected volume.
2. Automatically rotates tokens
3. Automatically expires the token when the pod is deleted.

Use `kuebctl get serviceaccounts` to get the list. 

## Sample service account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    kubernetes.io/enforce-mountable-secrets: "true"
  name: my-serviceaccount
  namespace: my-namespace
```