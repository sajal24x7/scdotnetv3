---
title: Type of Upgrades for Deployments in Kubernetes
slug: type-of-upgrades-for-deployments-in-kubernetes
created: 2026-10-27T06:29:00.000Z
updated: 2026-10-27T06:35:06.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520368043333271'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxkw3vsky2p'
  - 'https://www.threads.com/@sajal24x7/post/DfDRG39j5rN'
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
