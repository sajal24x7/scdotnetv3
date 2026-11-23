---
title: "RoleBinding in Kubernetes"
slug: "rolebinding-in-kubernetes"
created: 2026-11-23T20:44:00+02:00
updated: 2026-11-23T21:12:01+02:00
category: til
tags: ["k8s", "rbac"]
description: Using role bindings in Kubernetes
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
