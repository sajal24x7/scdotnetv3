---
tags:
  - "#windows"
  - "#cluster"
aliases:
  - How to assign weight to cluster nodes
---
We can toggle whether a node has 0 or 1 vote towards quorum membership. 

# How
Through UI > using the Configure Cluster Quorum Wizard > Select Voting configuration.

Through Powershell

```powershell
(Get-ClusterNode $node4).NodeWeight = 0
```

---
# references:
[What is Quorum Vote Weight in a Windows Server Failover Cluster?](https://www.altaro.com/hyper-v/quorum-vote-weight/)
>Essentially, as cluster nodes drop out of membership, you may reduce the number of remaining votes left in the cluster. This is nicknamed the “last man standing” quorum model – so long as one voter is online, the cluster stays running. If the same node frequently crashes, then you can assign this node 0 votes so that it essentially has no impact on the rest of the cluster. However, if different nodes lose availability at different times, it is a little harder to change the quorum weight as you need a more advanced PowerShell script which can dynamically change the node vote weight for different nodes.