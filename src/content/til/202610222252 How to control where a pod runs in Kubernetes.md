---
title: "How to Control Where a Pod Runs in Kubernetes"
slug: "how-to-control-where-a-pod-runs-in-kubernetes"
created: 2026-10-22T22:52:00+03:00
updated: 2026-10-23T16:34:00+03:00
category: til
tags: ["k8s"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491306075253659'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknwais5o2z'
  - 'https://www.threads.com/@sajal24x7/post/De2DSsplLn2'
---
Normally, we don't need to do this. But, if we need to there are a few ways to do this, mostly using selectors.

1. With `nodeSelector` field matching the [labels](/til/how-to-label-nodes-in-kubernetes) set on a node
2. With `nodeName` field
3. Using `affinity`