---
aliases:
  - Assigning Multiple IPs to Single NIC
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
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