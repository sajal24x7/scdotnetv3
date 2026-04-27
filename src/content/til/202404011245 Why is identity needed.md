---
title: Why Is Identity Needed
slug: why-is-identity-needed
pubDate: '2024-04-01T12:45:00+03:00'
updatedDate: '2024-04-01T12:45:00+03:00'
category: til
tags:
- azure
- identity
---

1. For any service, its critical to apply principle of least privilege
	1. With shared accounts we don't know who did what
	2. we can't give granular permissions because for shared id it needs to have sum of all required permissions
2. this requires granted security principals certain actions (roles) in a certain scope
3. a central store is required where identities are saved

---
# references: