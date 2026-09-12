---
title: Kubernetes Components
slug: kubernetes-components
created: 2026-09-12T08:26:00.000Z
updated: 2026-09-12T09:38:07.000Z
category: til
tags:
  - k8s
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117257651786369923'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mvcvilgcxd2c'
  - 'https://www.threads.com/@sajal24x7/post/DdLzDvlEd2U'
---
When you deploy a Kubernetes cluster, what you are deploying are nodes, which run the containerised applications.

Each cluster has two types of nodes:
1. **Master node(s)** host the *Kubernetes Control Plane* that controls and manages the whole Kubernetes system
2. **Worker node(s)** host the pods which are the components of the application.

```mermaid
graph TD
	subgraph WN[Worker Node]
		direction LR
		kubelet[kubelet] 
		runtime[Container Runtime] 
		proxy[kube-proxy]
	end
	
	subgraph MN[Master Node]
		direction LR
		api[kube-apiserver] 
		etcd[etcd] 
		scheduler[kube-scheduler] 
		controller[kube-controller-manager]
	end
```

# Kubernetes Control Plane
The Control Plane controls the cluster and makes it function.
It has the following components:
1. **kube-apiserver** which you and the other Control Plane components communicate with
2. **etcd** a reliable distributed data store that persistently stores the cluster configuration.
3. **kube-scheduler** watches for newly created [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) with no assigned [node](https://kubernetes.io/docs/concepts/architecture/nodes/), and selects a node for them to run on.
4. **kube-controller-manager** which performs cluster-level functions, such as replicating components, keeping track of worker nodes, handling node failures, and so on

# Node Components
1. **kubelet** an agent, which runs on each node in the cluster and talks to the API server and manages containers on its node
2. **kube-proxy** which load-balances network traffic between application components
3. **Container runtime** : docker, rkt, etc.
