---
title: "How to Create a Service Account in Kubernetes-2"
slug: "how-to-create-a-service-account-in-kubernetes-2"
created: 2026-11-25T15:53:00+02:00
updated: 2026-11-25T15:58:42+02:00
category: til
tags: ["k8s"]
description:
---
To create a [service account](/til/service-accounts-in-kubernetes):
1. Use command.

```bash
kubectl create serviceaccount <accountname>
```

2. Or, use the manifest file and apply using `kubectl apply -f`

