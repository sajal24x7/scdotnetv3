---
title: "Preemption in Kubernetes"
slug: "preemption-in-kubernetes"
created: 2026-10-24T13:41:00+03:00
updated: 2026-10-24T13:47:57+03:00
category: til
tags: ["k8s"]
---
Preemption specifies whether removing a pod with lower [pod priority](/pod-priority) than the one it is trying to schedule will allow this one to run. If such a [pod](/til/pods) is found, it is evicted to make way for the higher priority pod.

By default in [PriorityClass](/til/priority-class), the `preemptionPolicy` is set to `PreemptLowerPriority`, but it can be set to `Never` in which case these higher priority pods will not preempt other pods. Which might be useful in scenarios where you have a higher priority task but you don't want to kill existing tasks.