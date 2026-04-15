---
title: Bicep dependencies
slug: bicep-dependencies
pubDate: '2024-07-20T15:12:00+03:00'
updatedDate: '2024-07-20T15:12:00+03:00'
category: til
tags:
- azure
- bicep
---

- implicit
- Explicit

# Explicit definition
Using `dependsOn`

```bicep
dependsOn: [ dnsZone ]
```

---
# references:
[MS Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/resource-dependencies)