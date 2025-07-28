---
title: Windows cluster Tuning Network Thresholds
slug: windows-cluster-tuning-network-thresholds
pubDate: '2024-02-14T15:38:00+03:00'
updatedDate: '2024-02-14T15:38:00+03:00'
category: til
tags:
- windows
- cluster
---

```powershell
> get-cluster | fl *subnet*
CrossSubnetDelay          : 1000
CrossSubnetThreshold      : 20
PlumbAllCrossSubnetRoutes : 0
SameSubnetDelay           : 1000
SameSubnetThreshold       : 20
```

Heartbeat timeout is SameSubnetThreshold. 

SameSubnetDelay is in millisecond. 
So along with SameSubnetThreshold what this means is it will ping every 1 second 20 times till it gives an error. So for 20 seconds if there is no response, then it will give heartbeat timeout.

# Update
```powershell
(get-cluster).SameSubnetThreshold = 30
```

---
# references:

[Tuning Failover Cluster Network Thresholds - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/failover-clustering/tuning-failover-cluster-network-thresholds/ba-p/371834)