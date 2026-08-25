---
aliases:
  - Create entries in reverse lookup zone through PowerShell
tags:
  - "#powershell"
  - "#dns"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Add-DNSServerResourceRecordPTR -ZoneName $ZoneName -Name $ipAddress -PTRDomainName $hostname -ComputerName $dnsServer
```

This is the command. Name Needs to be in reverse order. so for example, for 10.45.32.23. Name will be 23.32 for zone "45.10.in-addr.arpa".

This can be done in excel. Split by "." and then concat. 
Or it can be done in PowerShell as well. Maybe a TODO for future.

---
# references: