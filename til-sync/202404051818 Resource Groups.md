---
aliases:
  - resource groups
  - RG
  - resource group
tags:
  - "#azure"
  - "#governance"
category: til
updated: 2026-08-25T14:30:56
---
Another construct for grouping together [[202404061212 Azure Resources|resources]]. Things that run together, might get decommissioned together, policies, etc.

1. I can create n number of [[202404061212 Azure Resources|resources]] under a [[202401101441 Azure subscriptions|subscription]]
2. Can not nest resource groups i.e. can't put one RG in another RG.
3. It is not a boundary for access
4. 1 [[202404061212 Azure Resources|resource]] can be a member of only 1 [[202404051818 Resource Groups|RG]]
5. created in an Azure region

---
# references: