---
title: How to Export Current Config to Edit in Yaml
slug: how-to-export-current-config-to-edit-in-yaml
created: 2026-10-23T13:31:00.000Z
updated: 2026-10-23T13:32:00.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117491307430871686'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myknwudvbz2n'
  - 'https://www.threads.com/@sajal24x7/post/De2DVN5FLBe'
---
You use `kubectl get` with `-o yaml`

```bash
kubectl get pod <pod-name> -o yaml > pod.yaml

```

Once yaml is exported, edit it with vi, and use `kubectl apply` to apply the config (after deleting the existing thing).
