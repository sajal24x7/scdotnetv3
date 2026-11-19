---
title: Organising Cluster Access Using KubeConfig File
slug: organising-cluster-access-using-kubeconfig-file
created: 2026-11-18T20:06:00.000Z
updated: 2026-11-18T20:30:19.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117640758866675516'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2mzrj4u7l2l'
  - 'https://www.threads.com/@sajal24x7/post/Df6A8T7gHOw'
---
A file under the home directory at `./kube/config` similar to perhaps `.bashrc` for setting aliases etc.. It contains common configuration used by kubectl to connect to the api server with the certs etc. This can be set using $KUBECONFIG environment variable as well to a specific file.

`Clusters` has a list of available clusters
`Users` has a list of available users
`Contexts` has a list of cluster + namespace + user together

Once the file is ready, you don't have to create a object (`kubectl apply`).

You can use `kubectl config view` to view the config.

You can use `kubectl config use-context <contextname>` to change context.
