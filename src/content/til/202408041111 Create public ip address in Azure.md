---
title: Create Public Ip Address in Azure
slug: create-public-ip-address-in-azure
created: '2024-08-04T11:11:00+03:00'
updated: '2024-08-04T11:11:00+03:00'
category: til
tags:
  - azure
  - network
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754974113230236'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnzac5xv23'
---



```powershell
$ip = @{
    Name = 'sajal-pip-0'
    ResourceGroupName = $RGName
    Location = $Location
    Sku = 'Standard'
    AllocationMethod = 'Static'
    IpAddressVersion = 'IPv4'
}
New-AzPublicIpAddress @ip
```

---
# references:
