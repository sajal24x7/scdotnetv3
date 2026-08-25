---
aliases:
  - Create VNIC in Azure
tags:
  - "#powershell"
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
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