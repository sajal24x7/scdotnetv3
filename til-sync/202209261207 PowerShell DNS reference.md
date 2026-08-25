---
aliases:
  - PowerShell DNS commands
tags:
  - "#powershell"
  - "#dns"
category: til
updated: 2026-08-25T14:30:56
---
# PowerShell General Commands  

## Find DNS record
```powershell
Get-DnsServerResourceRecord -ZoneName "kehi.okobank.net" | Where-Object {$_.HostName -eq 'devopstester'}

# DNS record based on type

```

## Find DNS zones
```
$DNSServer = ''
Get-DnsServerZone -ComputerName $DNSServer | select ZoneName, MasterServers | Export-Csv -Path C:\SupportFilesWindows\Logs\he5data.csv -NoClobber -NoTypeInformation -Encoding UTF8


### Find forwarder

```

## Create DNS record
```powershell
$DNSServer = '5ociwddnsap02'
Get-DnsServerZone -ComputerName $DNSServer
```



---
references:
[PowerShell-DNS-Reference](https://adamtheautomator.com/powershell-dns/)
[Add-DnsServerResourceRecord (DnsServer) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/dnsserver/add-dnsserverresourcerecord?view=windowsserver2022-ps)