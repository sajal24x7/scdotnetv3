---
title: Create Entries in Reverse Lookup Zone Through PowerShell
slug: create-entries-in-reverse-lookup-zone-through-powershell
created: '2024-04-17T16:50:00+03:00'
updated: '2024-04-17T16:50:00+03:00'
category: til
tags:
  - powershell
  - evergreen
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754924987542714'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modncvfqxw2u'
---

```powershell
Add-DNSServerResourceRecordPTR -ZoneName $ZoneName -Name $ipAddress -PTRDomainName $hostname -ComputerName $dnsServer
```

This is the command. Name Needs to be in reverse order. so for example, for 10.45.32.23. Name will be 23.32 for zone "45.10.in-addr.arpa".

This can be done in excel. Split by "." and then concat. 
Or it can be done in PowerShell as well. Maybe a TODO for future.

---
# references:
