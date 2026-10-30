---
title: Secrets in Kubernetes
slug: secrets-in-kubernetes
created: 2026-10-28T13:52:00.000Z
updated: 2026-10-28T13:59:17.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520371587828097'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxkxpavcp2o'
  - 'https://www.threads.com/@sajal24x7/post/DfDRNcbD3Z_'
---
Secrets are similar to [ConfigMaps](/til/configmaps-in-kubernetes) but are used to hold confidential data. Since these can be created separately from the pods, there is less risk of it being exposed.

These can be used to set environment variables for a container, for example.

There are few types:
1. Opaque - default
2. ServiceAccount Token
3. Docker config
4. Basic authentication 
5. TLS
6. Bootstrap token
