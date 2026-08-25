---
aliases:
  - Cosmos DB
tags:
  - "#azure"
  - "#database"
category: til
updated: 2026-08-25T14:30:56
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