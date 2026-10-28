---
title: "Secrets in Kubernetes"
slug: "secrets-in-kubernetes"
created: 2026-10-28T15:52:00+02:00
updated: 2026-10-28T15:59:17+02:00
category: til
tags: ["k8s"]
---
Secrets are similar to [ConfigMaps](/til/configmaps-in-kubernetes) but are used to hold confidential data. Since these can be created separately from the pods, there is less risk of it being exposed.

These can be used to set environment variables for a container, for example.

There are few types:
1. Opaque - default
2. ServiceAccount Token
3. Docker config
4. Basic authentication 
5. TLS
6. Bootstrap token