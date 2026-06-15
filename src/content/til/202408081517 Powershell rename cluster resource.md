---
title: Powershell Rename Cluster Resource
slug: powershell-rename-cluster-resource
created: '2024-08-08T15:17:00+03:00'
updated: '2024-08-08T15:17:00+03:00'
category: til
tags:
- powershell
- windows
---

```powershell
# Get all resources
Get-ClusterResource

Name                                      State  OwnerGroup        ResourceType   
----                                      -----  ----------        ------------   
Cluster Disk 1                            Online Available Storage Physical Disk  
Cluster Disk 2                            Online Cluster Group     Physical Disk  
Cluster IP Address                        Online Cluster Group     IP Address     
Cluster Name                              Online Cluster Group     Network Name   
GxClusPlugIn (OCIWPFSRCL02) (Instance001) Online Cluster Group     Generic Service

# Get resource you want to rename
Get-ClusterResource -Name 'Cluster Disk 2'

Name           State  OwnerGroup    ResourceType 
----           -----  ----------    ------------ 
Cluster Disk 2 Online Cluster Group Physical Disk


# Rename
(Get-ClusterResource -Name 'Cluster Disk 2').Name='Quorum Disk'
```

---
# references:
[PowerShell for Failover Clustering: Let’s Rename a Few Things - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/failover-clustering/powershell-for-failover-clustering-let-8217-s-rename-a-few/ba-p/371514)