---
title: DaemonSet in Kubernetes
slug: daemonset-in-kubernetes
created: 2026-10-23T13:41:00.000Z
updated: 2026-10-23T13:44:26.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117495523667538014'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mymju6x7be2g'
  - 'https://www.threads.com/@sajal24x7/post/De3-CnwFlPx'
---
DaemonSets allow a copy of a pod to run on all nodes. These are useful when the pod you want to run provides some critical functionality like networking - cilium, for example, or some monitoring component, etc.

They are defined similar to [ReplicaSets](/til/replicasets-in-kubernetes), with `apps/v1` and type of `DaemonSet`.
