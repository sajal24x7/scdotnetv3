---
title: Create Public Ip Address in Azure
slug: create-public-ip-address-in-azure
created: '2024-08-04T11:11:00+03:00'
updated: '2024-08-04T11:11:00+03:00'
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