---
title: How to Create Secrets in Kubernetes
slug: how-to-create-secrets-in-kubernetes
created: 2026-10-28T13:55:00.000Z
updated: 2026-10-28T14:11:43.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520372371327206'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxky2spnq2p'
  - 'https://www.threads.com/@sajal24x7/post/DfDRO7fjwBs'
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
