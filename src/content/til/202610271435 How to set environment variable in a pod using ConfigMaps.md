---
title: How to Set Environment Variable in a Pod Using ConfigMaps
slug: how-to-set-environment-variable-in-a-pod-using-configmaps
created: 2026-10-27T12:35:00.000Z
updated: 2026-10-27T13:13:49.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117520370565665184'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myxkxasvii2p'
  - 'https://www.threads.com/@sajal24x7/post/DfDRLmpj_pQ'
---
First, [create](/til/how-to-create-a-configmap-in-kubernetes) a [ConfigMap](/til/configmaps-in-kubernetes).

Then, in pod definition file, as an example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sajal-pod
spec:
  containers:
    - name: sajal-container
      image: registry.k8s.io/busybox:1.27.2
      command: [ "/bin/sh", "-c", "env" ]
      env:
        - name: SPECIAL_LEVEL_KEY
          valueFrom:
            configMapKeyRef:
              name: myconfigmap
              key: username
  restartPolicy: Never


```
