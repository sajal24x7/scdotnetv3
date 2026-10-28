---
title: "How to Use Secrets in a Pod"
slug: "how-to-use-secrets-in-a-pod"
created: 2026-10-28T16:14:00+02:00
updated: 2026-10-28T17:05:11+02:00
category: til
tags: ["k8s"]
---
There are a few ways to use [secrets](/til/secrets-in-kubernetes) with pods.

## Environment variables
Use `envFrom` with `secretRef`.

Sample file:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: envfrom-secret
spec:
  containers:
  - name: envars-test-container
    image: nginx
    envFrom:
    - secretRef:
        name: test-secret

```