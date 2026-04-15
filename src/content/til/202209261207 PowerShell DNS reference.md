---
title: PowerShell DNS reference
slug: powershell-dns-reference
pubDate: '2022-09-26T12:07:00+03:00'
updatedDate: '2022-09-26T12:07:00+03:00'
category: til
tags:
- powershell
- dns
---


# Powershell General Commands  

## Find DNS record
```powershell
Get-DnsServerResourceRecord -ZoneName "kehi.okobank.net" | Where-Object {$_.HostName -eq 'devopstester'}

# DNS record based on type

```

## Create DNS record
```powershell

```



---
references:
[PowerShell-DNS-Reference](https://adamtheautomator.com/powershell-dns/)
[Add-DnsServerResourceRecord (DnsServer) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/dnsserver/add-dnsserverresourcerecord?view=windowsserver2022-ps)