---
title: Create VNIC in Azure
slug: create-vnic-in-azure
created: '2024-08-04T11:16:00+03:00'
updated: '2024-08-04T11:16:00+03:00'
category: til
tags:
- powershell
- azure
- network
---

```powershell
## Create a network interface for the VM. ##
$nic = @{
    Name = "nic2"
    ResourceGroupName = $RGName
    Location = $Region
    Subnet = $vnet.Subnets[0]
}
$nicVM = New-AzNetworkInterface @nic
```

---
# references: