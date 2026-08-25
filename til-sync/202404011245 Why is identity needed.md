---
aliases:
  - Why is identity needed
  - Why do we need identities
tags:
  - "#azure"
  - "#identity"
category: til
updated: 2026-08-25T14:30:56
---
1. For any service, its critical to apply principle of least privilege
	1. With shared accounts we don't know who did what
	2. we can't give granular permissions because for shared id it needs to have sum of all required permissions
2. this requires granted security principals certain actions (roles) in a certain scope
3. a central store is required where identities are saved

---
# references: