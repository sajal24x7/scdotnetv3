---
title: Platespin SQL Queries
slug: platespin-sql-queries
created: '2022-09-26T12:57:00+03:00'
updated: '2022-09-26T12:57:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkbtejxh2s'
  - 'https://www.threads.com/@sajal24x7/post/DZnFkcsFq2Q'
---

```sql
USE protection;
SELECT Id, SourceMachineDisplayName, discoverySourceAddress
FROM Workloads;

DELETE
FROM Workloads
WHERE Id = '';
```

---
references:
