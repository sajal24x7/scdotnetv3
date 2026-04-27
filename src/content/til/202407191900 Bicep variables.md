---
title: Bicep Variables
slug: bicep-variables
pubDate: '2024-07-19T19:00:00+03:00'
updatedDate: '2024-07-19T19:00:00+03:00'
category: til
tags:
- azure
- bicep
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