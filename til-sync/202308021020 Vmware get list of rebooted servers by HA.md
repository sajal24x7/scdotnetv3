---
aliases:
  - Vmware get list of rebooted servers by HA
tags:
  - "#vmware"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
# Update the following

$VIServer = "fieslpvcs01.fi.tcsecp.com"  
$ClusterName = "FIES-SQL-PROD-Trusted"

Import-Module -Name VMware.PowerCLI  
Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm:$false  
Connect-VIServer -Server $VIServer  
$Cluster = Get-Cluster $ClusterName

$Events = $Cluster | Get-VM | Get-VIEvent | where {$_.FullFormattedMessage -match "vSphere HA restarted virtual machine"}

$Events | select ObjectName, CreatedTime

Disconnect-VIServer -Server $VIServer -Force -Confirm:$false

```

---
# references: