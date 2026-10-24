---
title: "How to Check If a Pod Is Static"
slug: "how-to-check-if-a-pod-is-static"
created: 2026-10-24T09:52:00+03:00
updated: 2026-10-24T10:29:59+03:00
category: til
tags: ["k8s"]
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