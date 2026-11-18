---
title: "Organising Cluster Access Using KubeConfig File"
slug: "organising-cluster-access-using-kubeconfig-file"
created: 2026-11-18T22:06:00+02:00
updated: 2026-11-18T22:30:19+02:00
category: til
tags: ["k8s"]
---
A file under the home directory at `./kube/config` similar to perhaps `.bashrc` for setting aliases etc.. It contains common configuration used by kubectl to connect to the api server with the certs etc. This can be set using $KUBECONFIG environment variable as well to a specific file.

`Clusters` has a list of available clusters
`Users` has a list of available users
`Contexts` has a list of cluster + namespace + user together

Once the file is ready, you don't have to create a object (`kubectl apply`).

You can use `kubectl config view` to view the config.

You can use `kubectl config use-context <contextname>` to change context.