---
title: "Role in Kubernetes"
slug: "role-in-kubernetes"
created: 2026-11-23T20:40:00+02:00
updated: 2026-11-23T21:11:34+02:00
category: til
tags: ["k8s", "rbac"]
description: Using roles in Kubernetes
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