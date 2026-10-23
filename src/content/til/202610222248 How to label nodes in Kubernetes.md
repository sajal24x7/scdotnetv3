---
title: How to Label Nodes in Kubernetes
slug: how-to-label-nodes-in-kubernetes
created: 2026-10-22T19:48:00.000Z
updated: 2026-10-22T19:54:52.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491305430270350'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknvx2hcg2o'
  - 'https://www.threads.com/@sajal24x7/post/De2DRepFGyN'
---
To label nodes in Kubernets:

```shell
kubectl label node <node-name> <key>=<value>

## Example
kubectl label node node01 size=large

```

Why do we use this? In scenarios where we want to use for example `nodeSelector` with [pods](/til/pods) to specify where it may be able to run. 
