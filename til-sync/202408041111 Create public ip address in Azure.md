---
aliases:
  - Create public ip address in Azure
tags:
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
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