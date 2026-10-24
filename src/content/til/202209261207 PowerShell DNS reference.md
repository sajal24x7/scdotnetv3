---
title: "PowerShell DNS Reference"
slug: "powershell-dns-reference"
created: 2022-09-26T12:07:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "dns"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk6agjot23'
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