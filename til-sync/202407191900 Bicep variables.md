---
aliases:
  - Bicep variables
tags:
  - "#azure"
  - "#bicep"
category: til
updated: 2026-08-25T14:30:56
---
```bicep
var Identifier =

# Examples
var appServicePlanName = 'toy-product-launch-plan'
```

- variable loops which can then be used later in the template

```bicep
var items = [for i in range(1, 5): 'item${i}']
```

---
# references: