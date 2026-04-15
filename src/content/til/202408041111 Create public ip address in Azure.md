---
title: Create public ip address in Azure
slug: create-public-ip-address-in-azure
pubDate: '2024-08-04T11:11:00+03:00'
updatedDate: '2024-08-04T11:11:00+03:00'
category: til
tags:
- azure
- network
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