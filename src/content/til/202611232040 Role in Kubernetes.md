---
title: Role in Kubernetes
slug: role-in-kubernetes
created: 2026-11-23T18:40:00.000Z
updated: 2026-11-23T19:11:34.000Z
category: til
tags:
  - k8s
  - rbac
description: Using roles in Kubernetes
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668987505713710'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkwfwtpq2i'
  - 'https://www.threads.com/@sajal24x7/post/DgG2gNwADcT'
---
Type of object defined by [RBAC API](/til/rbac-in-kubernetes).

A Role or ClusterRole contains rules that represent a set of permissions. Permissions are additive, there are no denies.

A Role sets permissions in a specific namespace.

ClusterRole is non-namespace specific.

## Example role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""] # "" indicates the core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]

```

## Example cluster role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" omitted since ClusterRoles are not namespaced
  name: secret-reader
rules:
- apiGroups: [""]
  #
  # at the HTTP level, the name of the resource for accessing Secret
  # objects is "secrets"
  resources: ["secrets"]
  verbs: ["get", "watch", "list"]

```
