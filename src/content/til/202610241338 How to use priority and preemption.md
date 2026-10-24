---
title: "How to Use Priority and Preemption"
slug: "how-to-use-priority-and-preemption"
created: 2026-10-24T13:38:00+03:00
updated: 2026-10-24T13:41:26+03:00
category: til
tags: ["k8s"]
---
1. Set up a [PriorityClass](/til/priority-class)
2. Create Pods with `priorityClassName` set to one of the added PriorityClasses. This can be added as a property to [deployment](/til/kubernetes-deployment) or [ReplicaSets](/til/replicasets-in-kubernetes).