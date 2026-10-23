---
title: How to Create a Deployment Using Kubectl
slug: how-to-create-a-deployment-using-kubectl
created: 2026-10-22T20:07:00.000Z
updated: 2026-10-22T20:09:44.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491306822641901'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknwlitsp2e'
---
To create a [deployment](/til/kubernetes-deployment), one way to do it is using the yaml file, but a quicker way to do it is via:

```bash

## With a image
kubectl create deployment test-deploy --image=nginx --replicas=3

```
