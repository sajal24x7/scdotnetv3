---
aliases:
  - SMB share does not work for cluster
tags:
  - "#powershell"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
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