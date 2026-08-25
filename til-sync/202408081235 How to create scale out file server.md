---
aliases:
  - How to create scale out file server
  - create scale out file server
tags:
  - "#windows"
  - "#cluster"
category: til
updated: 2026-08-25T14:30:56
---
How to create [[202407161044 Scale out file server|Scale out file server]] on Windows core.

There are 2 ways to do it:
1. Through admin center, or
2. Through powershell


```powershell
# On both nodes install file services and failover clustering
Add-WindowsFeature –name File-Services,Failover-Clustering -IncludeManagementTools
Add-WindowsFeature –name File-Services -IncludeManagementTools

# Test
Test-Cluster –Node 5ociwpfsrap02 , 7ociwpfsrap01 

# Create cluster
New-Cluster –Name JUMPUPDCLUSTER –Node 5ociwpfsrap02 , 7ociwpfsrap01 

# Add csv
Add-ClusterSharedVolume "ClusterDiskUPD"

# Add sofs ensure cluster object has create computer object permission on the ou
Add-ClusterScaleOutFileServerRole -Name JUMPUPD -Cluster JUMPUPDCLUSTER

# Create folder inside csv/shares path
New-Item -Name "JUMPUPD2019" -ItemType Directory

# Setup shares
New-SmbShare -Name "JUMPUPD2019" -Path "C:\ClusterStorage\Volume1\Shares\JUMPUPD2019" -FullAccess OP\GT-5ociwpfsrap02-ADM,OP\GT-7ociwpfsrap01-ADM,GT-JUMPUPD-Full
Set-SmbPathAcl –ShareName JUMPUPD2022

```

---
# references: