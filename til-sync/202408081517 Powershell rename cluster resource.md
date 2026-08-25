---
aliases:
  - Powershell rename cluster resource
  - Powershell rename cluster disk
tags:
  - "#powershell"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
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