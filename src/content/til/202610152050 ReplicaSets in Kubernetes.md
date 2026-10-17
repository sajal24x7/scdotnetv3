---
title: ReplicaSets in Kubernetes
slug: replicasets-in-kubernetes
created: 2026-10-15T17:50:00.000Z
updated: 2026-10-15T17:53:42.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117451558584925738'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mxyz3763mi2n'
  - 'https://www.threads.com/@sajal24x7/post/Dej-fY8oGjr'
---
ReplicaSets are a level up from [Pods in Kubernetes](/pods). They are a type of controller (replication-controller) which we use to ensure a certain number of pods are live.

It is part of `apps/v1` with kind of `ReplicaSet`.

It is different from the previously used ReplicationController in that we need to define a selector in it's definition file.
