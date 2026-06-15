---
title: Entra ID Administrative Units
slug: entra-id-administrative-units
created: '2024-01-06T15:15:00+03:00'
updated: '2024-01-06T15:15:00+03:00'
category: til
tags:
- azure
- entra
---

- Help manage permissions for managing Entra ID
- Can include a mix of users, devices and groups
	- roles added to AU will not apply to members of the group
	- users need to be added directly to AU
- Membership can be assigned or dynamic
- Objects can exist in multiple AUs - one user in 2 AUs
- Nesting is not possible - one AU under a different AU - No structure
- Not for B2C

Restricted admin units will not have inherited permissions from directory level for example. Only users who are explicitly given permissions to managed the AU will have access to do so.


---
# references