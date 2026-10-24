---
title: "Active Directory Forest"
slug: "active-directory-forest"
created: 2024-10-05T15:07:00+03:00
updated: 2026-09-20T14:40:14+03:00
category: til
tags: ["ad"]
---
- forest contains many [domains](/til/active-directory-domains)
	- all [domains](/til/active-directory-domains) in a forest share the same [schema](/til/active-directory-schema)
- forest can have non-contiguous [domain](/til/active-directory-domains) names
- When we create the first [domain](/til/active-directory-domains) it also creates the forest
	- This first [domain](/til/active-directory-domains) will become the root forest domain
- [Domain](/til/active-directory-domains)s in the forest trust via transitive trusts
- Functional level defines what features are available
	- possible to roll-back