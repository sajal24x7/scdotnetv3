---
title: "How to Export Current Config to Edit in Yaml"
slug: "how-to-export-current-config-to-edit-in-yaml"
created: 2026-10-23T16:31:00+03:00
updated: 2026-10-23T16:32:00+03:00
category: til
tags: ["k8s"]
---
You use `kubectl get` with `-o yaml`

```bash
kubectl get pod <pod-name> -o yaml > pod.yaml

```

Once yaml is exported, edit it with vi, and use `kubectl apply` to apply the config (after deleting the existing thing).