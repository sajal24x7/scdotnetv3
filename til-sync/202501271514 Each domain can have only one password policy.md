---
aliases:
  - Each domain can have only one password policy
tags:
  - "#windows"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
We would need to use fine-grained password policy to enable this. 
Another thing is that fine-grained password policy applies to users or groups not to OUs.
So, there should be a shadow group to enable this.

Password policy can not be linked to an OU.

---
# references:
[How To Configure a Domain Password Policy - Active Directory Pro](https://activedirectorypro.com/how-to-configure-a-domain-password-policy/)