---
title: How to Create a ConfigMap in Kubernetes
slug: how-to-create-a-configmap-in-kubernetes
created: 2026-10-27T12:24:00.000Z
updated: 2026-10-28T13:55:54.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520369701853968'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxkwumjva2z'
  - 'https://www.threads.com/@sajal24x7/post/DfDRKCljy26'
---
To create a [ConfigMap](/til/configmaps-in-kubernetes) in Kubernetes:
1. Create a file
2. Or directly create it using cli

## Sample File


```yaml
apiVersion: v1
kind: ConfigMap
metadata: 
  name: myconfigmap 
data:
  username: sajal
  access_level: 1
```

Then apply using `kubectl apply -f`

You can set it to immutable by using `immutable: true`

## Create from literal values
```
kubectl create configmap my-confi —-from-literal=username=sajal —-from-literal=access_leve=1
```
