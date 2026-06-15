---
title: Bicep Variables
slug: bicep-variables
created: '2024-07-19T19:00:00+03:00'
updated: '2024-07-19T19:00:00+03:00'
category: til
tags:
  - azure
  - bicep
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754961993164049'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modntpyuhy2v'
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
