---
title: How to Use Priority and Preemption
slug: how-to-use-priority-and-preemption
created: 2026-10-24T10:38:00.000Z
updated: 2026-10-24T10:41:26.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117496695813382802'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myn2j7gdkl2h'
  - 'https://www.threads.com/@sajal24x7/post/De4gJ2hFHvw'
---
1. Set up a [PriorityClass](/til/priority-class)
2. Create Pods with `priorityClassName` set to one of the added PriorityClasses. This can be added as a property to [deployment](/til/kubernetes-deployment) or [ReplicaSets](/til/replicasets-in-kubernetes).
