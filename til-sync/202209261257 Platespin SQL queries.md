---
aliases:
  - Platespin SQL queries
tags:
  - "#platespin"
  - "#sql"
category: til
updated: 2026-08-25T14:30:56
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