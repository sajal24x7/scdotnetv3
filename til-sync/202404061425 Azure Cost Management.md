---
aliases:
  - cost
  - budget
tags:
  - "#azure"
  - "#governance"
category: til
updated: 2026-08-25T14:30:56
---
Part of [[202404051739 Governance Overview|azure governance]]

1. Provides insight and control of Azure (and AWS) spend
	1. cost analysis
	2. cost anomaly alerts
	3. budgets
2. Estimate costs with Azure Pricing Calculator
3. Always optimize costs
4. Costs can be based on tag, [[202401101441 Azure subscriptions|subscription]], [[202404051818 Resource Groups|resource groups]]
# License
Cost Allocation with Enterprise Agreement or Customer Agreement
# How to split cost for shared services
Use cost allocation.
Split can be :
1. even
2. custom 
3. proportional (based on overall usage, compute usage, network usage, etc.)
So a team will see accumulated costs (whatever they use) + cost allocation (cost for shared resource)

# How to optimize costs
- Plan better /correct SKUs etc
	- autoscale, serverless, shutdown, etc.
- Reserved instances (1 or 3 year plan) offer discounts, etc (super-specific which sku which region)
- Azure savings plan (not super-specific) / lower discount than reserved.
- Azure Hybrid Initiative allows one to use existing licenses in Azure

---
# references: