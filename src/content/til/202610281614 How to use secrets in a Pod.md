---
title: How to Use Secrets in a Pod
slug: how-to-use-secrets-in-a-pod
created: 2026-10-28T14:14:00.000Z
updated: 2026-10-28T15:05:11.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520373236906959'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxkyhhs6p2i'
  - 'https://www.threads.com/@sajal24x7/post/DfDRQioD4Uy'
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
