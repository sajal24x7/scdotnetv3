---
title: RoleBinding in Kubernetes
slug: rolebinding-in-kubernetes
created: 2026-11-23T18:44:00.000Z
updated: 2026-11-23T19:12:01.000Z
category: til
tags:
  - k8s
  - rbac
description: Using role bindings in Kubernetes
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117668988206141125'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2zkwq2ynq2o'
  - 'https://www.threads.com/@sajal24x7/post/DgG2heUALOb'
---
A role binding grants the permissions defined in a [role](/til/role-in-kubernetes) to a user or set of users.

Similar to roles, a RoleBinding grants permissions in a [namespace](/namespaces-in-kubernetes), whereas ClusterRoleBinding is not bound to a namespace.

After a rolebinding is created, it can not be changed. It must be deleted and recreated. 
## Sample rolebinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
# This role binding allows "dave" to read secrets in the "development" namespace.
# You need to already have a ClusterRole named "secret-reader".
kind: RoleBinding
metadata:
  name: read-secrets
  #
  # The namespace of the RoleBinding determines where the permissions are granted.
  # This only grants permissions within the "development" namespace.
  namespace: development
subjects:
- kind: User
  name: dave # Name is case sensitive
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io

```
