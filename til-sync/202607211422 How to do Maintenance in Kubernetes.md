---
tags:
  - k8s
aliases:
  - How to do Maintenance in Kubernetes
category: til
updated: 2026-08-25T14:30:56
---
There can be three situations wherein we/controller manager does maintenance:
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

## Unhealthy nodes

A node can become unhealthy because of resource constraints. In this case, Kubernetes will shift the pod automatically to an available node.

## Node unreachable

In case something unplanned happens, network issue, or node reboot and `kubelet` can't inform control plane, then after a timeout, cluster will record the status as `unknown` and move the pods to a different node. The host will show as `NotReady.

However, because the kubelet on the faulty node cannot communicate with the control plane, it does not know to shut down its containers. They may still be running.