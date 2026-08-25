---
aliases:
  - management group
  - management groups
  - MG
tags:
  - "#azure"
  - "#governance"
category: til
updated: 2026-08-25T14:30:56
---
1. a hierarchy that can be created for better management of subscriptions
	1. All [[202401101441 Azure subscriptions|subscriptions]] under a management group inherit the conditions applied to the [[202404051803 Management groups|management group]]
2. A management group can have 6 levels of depth. It does not include the root MG. root MG has the same ID as tenant AAD ID.
3. by default all subscriptions get added to root MG.
4. 1 MG can have only 1 parent, but multiple children

---
# references: