---
title: "How to Create Secrets in Kubernetes"
slug: "how-to-create-secrets-in-kubernetes"
created: 2026-10-28T15:55:00+02:00
updated: 2026-10-28T16:11:43+02:00
category: til
tags: ["k8s"]
---
Similar to [how to create a ConfigMap](/til/how-to-create-a-configmap-in-kubernetes), we create [secrets](/til/secrets-in-kubernetes):
1. Using a file
2. Using command line

## Sample file

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm
```

Note that the fields in data field need to be encoded in base64.

So as an example `echo “root” | base64`

## Using CLI

```shell
kubectl create secret generic db-user-pass \
    --from-literal=username=root \
    --from-literal=password='whatever'
```