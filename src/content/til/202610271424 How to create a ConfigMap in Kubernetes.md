---
title: "How to Create a ConfigMap in Kubernetes"
slug: "how-to-create-a-configmap-in-kubernetes"
created: 2026-10-27T14:24:00+02:00
updated: 2026-10-28T15:55:54+02:00
category: til
tags: ["k8s"]
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