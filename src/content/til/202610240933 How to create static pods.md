---
title: "How to Create Static Pods"
slug: "how-to-create-static-pods"
created: 2026-10-24T09:33:00+03:00
updated: 2026-10-24T10:30:11+03:00
category: til
tags: ["k8s"]
---
To create [static pods](/til/static-pods) in [Kubernetes](/til/kubernetes):

Using manifests (which are simple yaml files) kept in the pod directory, by default - `/etc/kubernetes/manifests/`. 

There are two ways to set this path:
1. In the kubelet service file, setting is `pod-manifest-path` and it can be set to anything.
2. Another way to set the path is to use `config` option and pass it path to a config yaml and in that set `staticPodPath` to the directory you want.

Sample file:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: static-busybox
  labels:
    role: test
spec:
  containers:
    - name: busybox
      image: busybox
      command: ['sleep', ':1000']
```

`kubelet` processes all files in the directory, so a copy will be read and created as well.  `fileCheckFrequency` determines how long it takes for kubelet to see new changes, default 20s.

If the file has any errors, and the pod does not start, check `journalctl -u kubelet -f | grep -i manifest`

After creating the file in the directory, configure the kubelet on the node to set `staticPodPath` value in the kubelet config file.

Restart the kubelet service.