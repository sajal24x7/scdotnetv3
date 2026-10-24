---
title: "Each Domain Can Have Only One Password Policy"
slug: "each-domain-can-have-only-one-password-policy"
created: 2025-01-27T15:14:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["windows", "ad"]
---
We would need to use fine-grained password policy to enable this. 
Another thing is that fine-grained password policy applies to users or groups not to OUs.
So, there should be a shadow group to enable this.

Password policy can not be linked to an OU.

---
# references:
[How To Configure a Domain Password Policy - Active Directory Pro](https://activedirectorypro.com/how-to-configure-a-domain-password-policy/)