---
title: Platespin SQL Queries
slug: platespin-sql-queries
pubDate: '2022-09-26T12:57:00+03:00'
updatedDate: '2022-09-26T12:57:00+03:00'
category: til
tags: []
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