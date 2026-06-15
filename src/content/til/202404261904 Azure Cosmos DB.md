---
title: Azure Cosmos DB
slug: azure-cosmos-db
created: '2024-04-26T19:04:00+03:00'
updated: '2024-04-26T19:04:00+03:00'
category: til
tags:
- azure
- database
---

- This was built for the cloud / designed for global distribution / multi-write [[#Variable consistencies]]
- All types of NoSQL data can be stored in it

# Variable consistencies
- Because distance is large, there will always be drawbacks
- A tension between performance and consistency

STRONG | BOUNDED STALENESS | SESSION | CONSISTENT PREFIX | EVENTUAL

	Strong means everyone will see the same read.
	Session means everyone in the same session will see the same thing. (Most common)
	Eventual means eventually everyone will see the same thing.

What we choose depends on the type of app we are building.


---
# references: