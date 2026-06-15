---
title: Bicep Dependencies
slug: bicep-dependencies
created: '2024-07-20T15:12:00+03:00'
updated: '2024-07-20T15:12:00+03:00'
category: til
tags:
  - azure
  - bicep
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754965197411179'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnv6ufqd2m'
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
