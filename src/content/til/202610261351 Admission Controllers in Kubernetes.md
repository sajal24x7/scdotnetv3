---
title: "Admission Controllers in Kubernetes"
slug: "admission-controllers-in-kubernetes"
created: 2026-10-26T13:51:00+02:00
updated: 2026-10-26T13:57:15+02:00
category: til
tags: ["k8s"]
---
They are code in api-server which check the arriving data in a request to modify a resource. They do not apply to read requests.

Admission controller are applied after the authentication + authorization phase.

Some examples are - NameSpaceExists, EventRateLimit, etc. Full list at [docs](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/).

To check which plugins are enabled by default:

```
kube-apiserver -h | grep enable-admission-plugins
```