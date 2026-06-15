---
title: Create Azure DNS Zone and Records
slug: create-azure-dns-zone-and-records
created: '2024-07-27T12:15:00+03:00'
updated: '2024-07-27T12:15:00+03:00'
category: til
tags:
- azure
- powershell
---

[[202404141450 Azure DNS|Azure DNS]]

```powershell
# Create a public zone
New-AzDNSZone



# Create a private zone
$RGName = 'user-hnbymdftfrzr'
$Zone = New-AzPrivateDnsZone -Name "sajalkc.net" -ResourceGroupName $RGName

```

---
# references:
[Command ref](https://learn.microsoft.com/en-us/powershell/module/az.dns/new-azdnszone?view=azps-12.1.0)
[MS Docs - Public Zone](https://learn.microsoft.com/en-us/azure/dns/dns-getstarted-powershell)
[MS Docs- Private Zone](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-powershell)