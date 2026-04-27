---
title: Windows Cluster Troubleshooting
slug: windows-cluster-troubleshooting
pubDate: '2023-09-13T12:26:00+03:00'
updatedDate: '2023-09-13T12:26:00+03:00'
category: til
tags:
- windows
- cluster
---

```
Get-ClusterLog

## with timespan for last 5 mins
Get-ClusterLog -Timespan 530

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