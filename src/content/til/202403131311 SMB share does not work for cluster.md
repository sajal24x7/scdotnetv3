---
title: SMB Share Does Not Work for Cluster
slug: smb-share-does-not-work-for-cluster
created: '2024-03-13T13:11:00+03:00'
updated: '2024-03-13T13:11:00+03:00'
category: til
tags:
- powershell
- windows
---


```powershell

## Workaround
Get-ClusterResource"resource name"| Set-ClusterParameter EnableNetBIOS 1
Stop-ClusterResource"resource name"
Start-ClusterResource"resource name"
```

---
# references:
[NetBIOS and WINS don't bind to cluster IP address resources - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/high-availability/netbios-wins-dont-bind-cluster-ip-address-resources)