---
title: Solarwinds IPAM reference
slug: solarwinds-ipam-reference
pubDate: '2022-09-26T12:32:00+03:00'
updatedDate: '2022-09-26T12:32:00+03:00'
category: til
tags: []
---


[Python](https://github.com/solarwinds/orionsdk-python)

[Powershell](https://github.com/solarwinds/OrionSDK/tree/master/Samples/PowerShell)

  

## Concurrent calls return the same IP

[Thwack Reference](https://thwack.solarwinds.com/product-forums/the-orion-platform/f/orion-sdk/46254/concurrent-update-the-same-ipam-ipnode-table-python-orion-sdk/98236#98236)

  

When making concurrent calls, i.e. concurrent find first IP and reserve it, it will always have a chance of returning the same result, as these call are without transactional support.

  

Hence, we use StartIpReservation/FinishIpReservation/CancelIpReservation trio of verb calls on IPAM.SubnetManagement to make sure that this does not happen.

  

Alternate approach is to use a random sleep in the command such that concurrent calls don't go in. But it doesn't make sense to put in longer than 10 sec sleep. And the more the number of VMs in the deployment (10 for example) the higher the chances of two random sleeps being the same, and hence the same issue.

  

So, we decided to go with the 1st method. The official method.

  

## CRUD updates references

https://github.com/Wyko/DeployACI/blob/85e1988232ca66fbecfcebad5eb97758b06c1cf6/deployaci/swipam.py#L132

  

[IPAM reference](https://github.com/solarwinds/OrionSDK/wiki/IPAM-2019.4-and-higher-versions-API)

  

Example:

```powershell

Set-SwisObject $swis -Uri 'swis://localhost/Orion/IPAM.Subnet/SubnetId=100,ParentId=2' -Properties @{VLAN='test'}

```
---
references:
[SWIS REST API Port Deprecation, did you know? - Orion SDK - The Orion Platform - THWACK (solarwinds.com)](https://thwack.solarwinds.com/product-forums/the-orion-platform/f/orion-sdk/98142/swis-rest-api-port-deprecation-did-you-know)
