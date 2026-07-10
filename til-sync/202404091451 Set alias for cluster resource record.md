---
tags:
  - "#windows"
  - "#cluster"
  - "#powershell"
aliases:
---
```powershell
# This resource needs to be Network Name
Get-ClusterResource "MyClusterName" | Get-ClusterParameter Aliases

Get-ClusterResource "MyClusterName" | Set-ClusterParameter Aliases AliasName
```

After setting it, need to stop and start the role. 

Note:
1. For SQL server with added FS role. Fileserver resource does not have any alias property. It needs to be set for the SQLserver role.

---
# references:
[How to Configure an Alias for a Clustered SMB Share with Windows Server 2012 - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/failover-clustering/how-to-configure-an-alias-for-a-clustered-smb-share-with-windows/ba-p/371737)