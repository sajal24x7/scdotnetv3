---
aliases:
  - Create Azure DNS zone and records
tags:
  - "#azure"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
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