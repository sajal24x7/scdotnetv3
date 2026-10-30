---
title: "How to Do Maintenance in Kubernetes"
slug: "how-to-do-maintenance-in-kubernetes"
created: 2026-07-21T14:22:00+03:00
updated: 2026-10-30T09:06:41+02:00
category: til
tags: ["k8s"]
---
There can be three situations wherein we/controller manager does maintenance in [Kubernetes](/til/kubernetes):

1. Node Draining and Cordoning (Planned activity)
2. Unhealthy nodes
3. Node not reachable

## Node Draining and Cordoning

``` bash
$ kubectl drain --ignore-daemonsets host04
```

After this the node will go in `Ready,SchedulingDisabled` state. Then we can reboot the node. 

To uncordon: 

```bash
$ kubectl uncordon host04
```

If there are any pods not managed by a controller, drain will not go through, unless we specify `--force` option. If we use `force` and it does not have a controller specified, the pod will be deleted. 
## Unhealthy nodes

A node can become unhealthy because of resource constraints. In this case, Kubernetes will shift the pod automatically to an available node.

## Node unreachable

In case something unplanned happens, network issue, or node reboot and `kubelet` can't inform control plane, then after a timeout, cluster will record the status as `unknown` and move the pods to a different node. The host will show as `NotReady.

However, because the kubelet on the faulty node cannot communicate with the control plane, it does not know to shut down its containers. They may still be running.