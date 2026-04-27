---
title: Vmware Get List of Rebooted Servers by HA
slug: vmware-get-list-of-rebooted-servers-by-ha
pubDate: '2023-08-02T10:20:00+03:00'
updatedDate: '2023-08-02T10:20:00+03:00'
category: til
tags: []
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