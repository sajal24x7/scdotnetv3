---
title: How to Create a Certificate Using CSR Object in Kubernetes
slug: how-to-create-a-certificate-using-csr-object-in-kubernetes
created: 2026-11-17T20:21:00.000Z
updated: 2026-11-17T20:28:41.000Z
category: til
tags:
  - k8s
  - cert
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117634721071885597'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2kdxtey762i'
  - 'https://www.threads.com/@sajal24x7/post/Df3RN9pIO6l'
---
1. Create a private key and x509 CSR.
2. Create a [CSR object in Kubernetes](/til/certificatesigningrequest-object-in-kubernetes).
3. Apply `kubectl apply -f myuser.yaml`
4. Get the list of available CSRs.

```bash
# To get list
kubectl get csr

## To delete a csr
kubectl delete csr <csrname>
```

5. Approve/reject the request

```bash
kubectl certificate approve <csrname>

# To deny
kubectl certificate deny <csrname>****
```
