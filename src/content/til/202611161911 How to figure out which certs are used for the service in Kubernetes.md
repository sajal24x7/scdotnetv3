---
title: "How to Figure Out Which Certs Are Used for the Service in Kubernetes"
slug: "how-to-figure-out-which-certs-are-used-for-the-service-in-kubernetes"
created: 2026-11-16T19:11:00+02:00
updated: 2026-11-16T19:25:45+02:00
category: til
tags: ["k8s", "cert"]
---
Open the manifest file (usually under /etc/kubernetes/manifests/)

The different files will be listed there, as an example:

```yaml
pec:
  containers:
  - command:
    - etcd
    - --advertise-client-urls=https://192.168.76.153:2379
    - --cert-file=/etc/kubernetes/pki/etcd/server.crt
    - --client-cert-auth=true
    - --data-dir=/var/lib/etcd
    - --feature-gates=InitialCorruptCheck=true
    - --initial-advertise-peer-urls=https://192.168.76.153:2380
    - --initial-cluster=controlplane=https://192.168.76.153:2380
    - --key-file=/etc/kubernetes/pki/etcd/server.key
    - --listen-client-urls=https://127.0.0.1:2379,https://192.168.76.153:2379
    - --listen-metrics-urls=http://127.0.0.1:2381
    - --listen-peer-urls=https://192.168.76.153:2380
    - --name=controlplane
    - --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt
    - --peer-client-cert-auth=true
    - --peer-key-file=/etc/kubernetes/pki/etcd/peer.key
    - --peer-trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
    - --snapshot-count=10000
    - --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
    - --watch-progress-notify-interval=5s
```

Then you can just [read the cert using openssl](/openssl-read-certificate-details).