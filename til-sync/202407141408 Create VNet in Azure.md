---
aliases:
  - Create VNet in Azure
  - Powershell Create VNet in Azure
tags:
  - "#powershell"
  - "#azure"
  - "#network"
category: til
updated: 2026-08-25T14:30:56
---
Create [[202404121703 Azure VNet|VNet]] in [[202312231415 Azure Master|Azure]]

```powershell
# Variables
$VNetName = 'vnet1'
$VNetRange = '10.0.0.0/24'
$RGName = 'user-fiahxmxusscf'
$Location = 'eastus'
$SubnetName = 'default'
$SubnetRange = '10.1.0.0/22'


# Create vnet
$vnet = @{
    Name = $VNetName
    ResourceGroupName = $RGName
    Location = $Location
    AddressPrefix = $VNetRange
}
$virtualNetwork = New-AzVirtualNetwork @vnet

# Add subnet
$subnet = @{
    Name = $SubNetName
    VirtualNetwork = $virtualNetwork
    AddressPrefix = $SubnetRange
}
$subnetConfig = Add-AzVirtualNetworkSubnetConfig @subnet

# Set vnet
$virtualNetwork | Set-AzVirtualNetwork
```


---
# references: