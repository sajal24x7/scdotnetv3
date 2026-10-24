---
title: How to Check If a Pod Is Static
slug: how-to-check-if-a-pod-is-static
created: 2026-10-24T06:52:00.000Z
updated: 2026-10-24T07:29:59.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117495526017329929'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mymjvbacqc2i'
---
1. The pod name has the node name appended to it, like `kube-apiserver-controlplane` for example
2. Run `kubectl get pod <podname> -o yaml`
	1. It will have a property : `kubernetes.io/config.source: file`
	2. `kubernetes.io/config.mirror` annotation is also there
3. Most reliable, under `ownerReferences`, `kind` will be mentioned as `Node`. Example:

```bash
ownerReferences:
  - apiVersion: v1
    controller: true
    kind: Node
    name: controlplane
    uid: f27d5339-c033-4a76-965e-c5730e08dac8
```

4. Finally, on the node you can check the manifests directory.
