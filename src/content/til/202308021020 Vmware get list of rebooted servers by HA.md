---
title: Vmware Get List of Rebooted Servers by HA
slug: vmware-get-list-of-rebooted-servers-by-ha
created: '2023-08-02T10:20:00+03:00'
updated: '2023-08-02T10:20:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754752288847984'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkueknpc2s'
  - 'https://www.threads.com/@sajal24x7/post/DZnGwYAlgmC'
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
