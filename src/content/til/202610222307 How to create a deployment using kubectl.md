---
title: "How to Create a Deployment Using Kubectl"
slug: "how-to-create-a-deployment-using-kubectl"
created: 2026-10-22T23:07:00+03:00
updated: 2026-10-23T16:33:33+03:00
category: til
tags: ["k8s"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491306822641901'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknwlitsp2e'
  - 'https://www.threads.com/@sajal24x7/post/De2g2yNlAJZ'
---
To create a [deployment](/til/kubernetes-deployment), one way to do it is using the yaml file, but a quicker way to do it is via:

```bash

## With a image
kubectl create deployment test-deploy --image=nginx --replicas=3

```