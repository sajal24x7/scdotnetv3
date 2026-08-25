---
aliases:
  - Preferred owners in a cluster
tags:
  - "#cluster"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
Setting preferred owners just sets the order in which nodes failover to.

For example, for a four node cluster if we set nodes {3,4} as preferred owners, then failover order will be {3,4,1,2}. If the group is on node 4, and failover happens, it will go to node 1 not 3.

# How to set cluster owner node with powershell

```powershell
# Set preferred owner
$resourceGroup = Get-ClusterGroup -Name "<ResourceGroupName>"
$resourceGroup | Set-ClusterOwnerNode -Owners "<PreferredNodeName>"

# Disable failback
$resourceGroup | Set-ClusterParameter -Name "FailbackType" -Value 0
```

---
# references:
[Preferred Owners in a Cluster | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/failoverclustering/preferred-owners-in-a-cluster/371290)
