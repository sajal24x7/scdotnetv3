---
title: "Type of Upgrades for Deployments in Kubernetes"
slug: "type-of-upgrades-for-deployments-in-kubernetes"
created: 2026-10-27T08:29:00+02:00
updated: 2026-10-27T08:35:06+02:00
category: til
tags: ["k8s"]
---
There are two ways to do upgrades for [deployments](/til/kubernetes-deployment) in [Kubernetes](/til/kubernetes):
1. Rolling upgrades - default
2. Recreate

## Recreate
All existing pods are killed before new pods are created.

## Rolling Upgrades
It replaces some pods at a time (controlled via `maxUnavailable` and `maxSurge`).

`maxUnavailable` specifies the max number of pods that can be unavailable during an upgrade. It can be a number (like 2) or a percentage (like 25%)

`maxSurge` specifies the max number of pods that can be created during the upgrade. It can be a number of a percentage.

Default value for both is 25%.