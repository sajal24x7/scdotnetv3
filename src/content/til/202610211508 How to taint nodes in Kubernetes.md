---
title: How to Taint Nodes in Kubernetes
slug: how-to-taint-nodes-in-kubernetes
created: 2026-10-21T12:08:00.000Z
updated: 2026-10-22T19:56:37.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491304846250590'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknvolx7u2g'
  - 'https://www.threads.com/@sajal24x7/post/De2g1wVFJ3j'
---
Use the `taint` command.

```
kubectl taint nodes node01 key=value:NoSchedule
```
