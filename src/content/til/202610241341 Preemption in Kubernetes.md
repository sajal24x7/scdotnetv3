---
title: Preemption in Kubernetes
slug: preemption-in-kubernetes
created: 2026-10-24T10:41:00.000Z
updated: 2026-10-24T10:47:57.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117496696505250549'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myn2jk4bzi2q'
  - 'https://www.threads.com/@sajal24x7/post/De4gLN2lEcR'
---
Preemption specifies whether removing a pod with lower [pod priority](/pod-priority) than the one it is trying to schedule will allow this one to run. If such a [pod](/til/pods) is found, it is evicted to make way for the higher priority pod.

By default in [PriorityClass](/til/priority-class), the `preemptionPolicy` is set to `PreemptLowerPriority`, but it can be set to `Never` in which case these higher priority pods will not preempt other pods. Which might be useful in scenarios where you have a higher priority task but you don't want to kill existing tasks.
