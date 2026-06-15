---
title: Bicep Functions
slug: bicep-functions
created: '2024-07-20T14:33:00+03:00'
updated: '2024-07-20T14:33:00+03:00'
category: til
tags:
  - azure
  - bicep
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754964783767486'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnuyliqy26'
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
