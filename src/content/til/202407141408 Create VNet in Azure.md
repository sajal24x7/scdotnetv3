---
title: "Create VNet in Azure"
slug: "create-vnet-in-azure"
created: 2024-07-14T14:08:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "azure", "network"]
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754954381026735'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnqbqdee2o'
---
Create [VNet](/til/azure-vnet) in [Azure](/til/azure-master)

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