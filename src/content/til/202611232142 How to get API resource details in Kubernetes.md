---
title: "How to Get API Resource Details in Kubernetes"
slug: "how-to-get-api-resource-details-in-kubernetes"
created: 2026-11-23T21:42:00+02:00
updated: 2026-11-23T21:48:39+02:00
category: til
tags: ["k8s", "rbac"]
description: Find details about api-resources
---
```bash

# To check if resource is namespaced or not
# Useful when deciding whether to create a role or clusterrole
kubectl api-resources --namespaced=false
kubectl api-resources --namespaced=true # this is also default

```

The api version which is the output of this command specifies whether resource is core resource (as "" in [role](/til/role-in-kubernetes) definition for example) or not. V1 is core api-resource. Others need to be specified.

```bash
k api-resources | grep deploy
deployments                         deploy       apps/v1                           true         Deployment
```