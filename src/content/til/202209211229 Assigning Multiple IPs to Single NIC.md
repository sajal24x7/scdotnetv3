---
title: Assigning Multiple IPs to Single NIC
slug: assigning-multiple-ips-to-single-nic
created: '2022-09-21T12:29:00+03:00'
updated: '2022-09-21T12:29:00+03:00'
category: til
tags:
  - windows
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk36aqld23'
---

# Issue:
When adding multiple IPs to a single NIC, DNS entry keep getting updated with the IPs which are not primary.

# Fix:

## To list IPs

```powershell
Get-NetIPAddress -AddressFamily IPv4 | ft IPAddress, InterfaceAlias, SkipAsSource
```

## Add new IP

```powershell
New-NetIPAddress –IPAddress "10.45.38.22" –PrefixLength 22 –InterfaceAlias “Prod” –SkipAsSource $True
```

## Set skip as source property

```powershell
Get-NetIPAddress 192.168.1.92 | Set-NetIPAddress -SkipAsSource $False
```

---
references:
[Online reference](http://woshub.com/assign-multiple-ip-addresses-single-nic-windows/)
