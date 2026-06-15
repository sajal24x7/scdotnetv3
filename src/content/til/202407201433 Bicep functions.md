---
title: Bicep Functions
slug: bicep-functions
created: '2024-07-20T14:33:00+03:00'
updated: '2024-07-20T14:33:00+03:00'
category: til
tags:
- azure
- bicep
---

# Get ID of resources
[ResourceID](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions-resource#resourceid) to get ID of Resources.
To get subnetid:
```bicep
resourceId('Microsoft.Network/virtualNetworks/subnets/', virtualNetworkName, subnetName)
```

---
# references:
[MS Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/bicep-functions)
