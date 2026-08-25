---
aliases:
  - How to assign licenses in Entra
  - How to assign licenses in Entra ID
tags:
  - "#azure"
  - "#entra"
category: til
updated: 2026-08-25T14:30:56
---
Related to [[202312231437 Entra ID editions|Entra ID Licenses]]

- [[202401101139 Entra ID users|Entra ID user]] can be assigned licenses from multiple places
	- End result is sum of all licenses
	- if same license is applied from multiple places, license is consumed once
- Licenses can be assigned to dynamic [[202312242245 Entra ID Groups|entra groups]]
	- however if rule is changed then removed users lose the licenses
- Not possible to delete a [[202312242245 Entra ID Groups|entra group]] which has [[202312231437 Entra ID editions|Entra ID Licenses]] applied to it
- Can delete a user who has [[202312231437 Entra ID editions|Entra ID Licenses]] applied
- Licenses only apply to following
	- Security groups
	- M365 groups with securityEnabled=TRUE
- Licenses only apply to first level for nested groups. so only direct members in a [[202312242245 Entra ID Groups|entra group]]

# Steps

1. Go to Entra Admin Center.
2. Go to **Identity** > **Billing** > **Licenses**.
3. Select License and click Assign.
4. Select [[202401101139 Entra ID users|Entra ID user]] or [[202312242245 Entra ID Groups|entra group]] and assign.

---
# references:
[How to assign licenses to users](https://learn.microsoft.com/en-us/entra/fundamentals/license-users-groups)
[Group based licensing](https://learn.microsoft.com/en-us/entra/fundamentals/concept-group-based-licensing)
[Limitations and issues](https://learn.microsoft.com/en-us/entra/identity/users/licensing-group-advanced)