---
aliases:
  - Bicep functions
tags:
  - "#azure"
  - "#bicep"
category: til
updated: 2026-08-25T14:30:56
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
