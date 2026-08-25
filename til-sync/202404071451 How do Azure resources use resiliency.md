---
aliases:
  - How do Azure resources use resiliency
tags:
  - "#azure"
  - "#resiliency"
category: til
updated: 2026-08-25T14:30:56
---
1. Some resources are global and resilient against regional failure
	1. Azure AD, Front Door, Traffic Manager, DNS zones
2. Most are deployed to specific region where services might differ
	1. Regional - don't know where anything is
	2. Zone-Redundant --> [[202312231415 Azure Master|Azure]] takes care of resiliency across different AZs
	3. Zonal --> exists in a specific zone/benefit is I know where it is

---
# references: