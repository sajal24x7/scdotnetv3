---
title: Admission Controllers in Kubernetes
slug: admission-controllers-in-kubernetes
created: 2026-10-26T11:51:00.000Z
updated: 2026-10-26T11:57:15.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117509097695915935'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3myskqwsqlw2o'
  - 'https://www.threads.com/@sajal24x7/post/De-JGNeAXSp'
---
They are code in api-server which check the arriving data in a request to modify a resource. They do not apply to read requests.

Admission controller are applied after the authentication + authorization phase.

Some examples are - NameSpaceExists, EventRateLimit, etc. Full list at [docs](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/).

To check which plugins are enabled by default:

```
kube-apiserver -h | grep enable-admission-plugins
```
