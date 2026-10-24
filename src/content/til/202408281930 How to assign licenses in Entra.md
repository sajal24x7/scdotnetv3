---
title: "How to Assign Licenses in Entra"
slug: "how-to-assign-licenses-in-entra"
created: 2024-08-28T19:30:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["azure", "entra"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoafw4o72s'
  - 'https://mastodon.social/@sajal24x7/116756211506690917'
---
Related to [Entra ID Licenses](/til/entra-id-editions)

- [Entra ID user](/til/entra-id-users) can be assigned licenses from multiple places
	- End result is sum of all licenses
	- if same license is applied from multiple places, license is consumed once
- Licenses can be assigned to dynamic [entra groups](/til/entra-id-groups)
	- however if rule is changed then removed users lose the licenses
- Not possible to delete a [entra group](/til/entra-id-groups) which has [Entra ID Licenses](/til/entra-id-editions) applied to it
- Can delete a user who has [Entra ID Licenses](/til/entra-id-editions) applied
- Licenses only apply to following
	- Security groups
	- M365 groups with securityEnabled=TRUE
- Licenses only apply to first level for nested groups. so only direct members in a [entra group](/til/entra-id-groups)

# Steps

1. Go to Entra Admin Center.
2. Go to **Identity** > **Billing** > **Licenses**.
3. Select License and click Assign.
4. Select [Entra ID user](/til/entra-id-users) or [entra group](/til/entra-id-groups) and assign.

---
# references:
[How to assign licenses to users](https://learn.microsoft.com/en-us/entra/fundamentals/license-users-groups)
[Group based licensing](https://learn.microsoft.com/en-us/entra/fundamentals/concept-group-based-licensing)
[Limitations and issues](https://learn.microsoft.com/en-us/entra/identity/users/licensing-group-advanced)