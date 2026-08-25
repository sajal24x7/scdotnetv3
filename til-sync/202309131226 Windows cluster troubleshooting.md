---
aliases:
  - []
tags:
  - "#windows"
  - "#cluster"
category: til
updated: 2026-08-25T14:30:56
---
```
Get-ClusterLog

## with timespan for last 5 mins
Get-ClusterLog -Timespan 5

## Use local server time
Get-ClusterLog -Destination C:\Users\A714359\Desktop\ -TimeSpan 30 -UseLocalTime
```

## Log location
```text
C:\Windows\Cluster\Reports
```


# Cluster hive
Located under HKLM > Cluster or 0.Cluster (loaded on node which has quorum disk)

## Computer object guid



---
# references:
[Get-ClusterLog (FailoverClusters) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/failoverclusters/get-clusterlog?view=windowsserver2022-ps)

[The Cluster and 0.Cluster Registry Hives - Working Hard In ITWorking Hard In IT](https://blog.workinghardinit.work/2016/03/29/the-cluster-and-0-cluster-registry-hives/)

[Failover Clustering | Microsoft Community Hub](https://techcommunity.microsoft.com/category/windows-server/blog/failoverclustering)