---
title: Create NSG in Azure
slug: create-nsg-in-azure
created: '2024-07-14T14:19:00+03:00'
updated: '2024-07-14T14:19:00+03:00'
category: til
tags:
  - powershell
  - azure
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754955324302669'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnqowqvv2s'
---

```powershell

# Variables
$RGName = "user-fiahxmxusscf"
$Region = "eastus"
$port=8081 
$rulename="allowAppPort$port" 
$nsgname="sf-vnet-security"
$NICName = "nic2"


# Create NSG
New-AzNetworkSecurityGroup -Name $nsgname -ResourceGroupName $RGName  -Location $Region

# Attach NSG to VM NIC
## Get NIC
$VMNIC = Get-AzNetworkInterface -Name $NICName -ResourceGroupName $RGName

## Get NSG
$NSG = Get-AzNetworkSecurityGroup -Name $nsgname -ResourceGroupName $RGName

##Attach NSG
$VMNIC.NetworkSecurityGroup = $NSG

## Set NIC
$VMNIC | Set-AzNetworkInterface



```

---
# references:
