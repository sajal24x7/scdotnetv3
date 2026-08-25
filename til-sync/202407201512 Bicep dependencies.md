---
aliases:
  - Bicep dependencies
tags:
  - "#azure"
  - "#bicep"
category: til
updated: 2026-08-25T14:30:56
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