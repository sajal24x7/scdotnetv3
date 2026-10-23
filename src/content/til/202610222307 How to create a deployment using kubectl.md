---
title: "How to Create a Deployment Using Kubectl"
slug: "how-to-create-a-deployment-using-kubectl"
created: 2026-10-22T23:07:00+03:00
updated: 2026-10-22T23:09:44+03:00
category: til
tags: ["k8s"]
---
To create a [deployment](/til/kubernetes-deployment), one way to do it is using the yaml file, but a quicker way to do it is via:

```bash

## With a image
kubectl create deployment test-deploy --image=nginx --replicas=3

```