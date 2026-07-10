---
tag: #platespin, #sql
aliases:
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