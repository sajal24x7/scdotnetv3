---
title: How to Create a Service Account in Kubernetes-2
slug: how-to-create-a-service-account-in-kubernetes-2
created: 2026-11-25T13:53:00.000Z
updated: 2026-11-25T13:58:42.000Z
category: til
tags:
  - k8s
description: null
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117678671760948530'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n35ukcpijb2c'
  - 'https://www.threads.com/@sajal24x7/post/DgLQWlln_yr'
---
To create a [service account](/til/service-accounts-in-kubernetes):
1. Use command.

```bash
kubectl create serviceaccount <accountname>
```

2. Or, use the manifest file and apply using `kubectl apply -f`

