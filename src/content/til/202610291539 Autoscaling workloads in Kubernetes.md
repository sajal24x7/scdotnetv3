---
title: Autoscaling Workloads in Kubernetes
slug: autoscaling-workloads-in-kubernetes
created: 2026-10-29T13:39:00.000Z
updated: 2026-10-29T14:20:02.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117529268182703540'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mz3jfg5pqx2q'
  - 'https://www.threads.com/@sajal24x7/post/DfHUIrAoNw9'
---
Autoscaling means automatically updating an object that maintains a set of pods ([Deployments](/til/kubernetes-deployment), for example )

There are a few ways to do this-
1. Horizontal scaling with [HPA](/horizontal-pod-autoscaling)
2. Vertical scaling with [VPA](/vertical-pod-autoscaler)
3. Autoscaling based on cluster size
4. Event driven (KEDA)
