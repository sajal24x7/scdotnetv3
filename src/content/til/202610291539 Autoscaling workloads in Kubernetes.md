---
title: "Autoscaling Workloads in Kubernetes"
slug: "autoscaling-workloads-in-kubernetes"
created: 2026-10-29T15:39:00+02:00
updated: 2026-10-29T16:20:02+02:00
category: til
tags: ["k8s"]
---
Autoscaling means automatically updating an object that maintains a set of pods ([Deployments](/til/kubernetes-deployment), for example )

There are a few ways to do this-
1. Horizontal scaling with [HPA](/horizontal-pod-autoscaling)
2. Vertical scaling with [VPA](/vertical-pod-autoscaler)
3. Autoscaling based on cluster size
4. Event driven (KEDA)
