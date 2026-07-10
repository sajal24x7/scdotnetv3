---
tags:
  - "#windows"
  - "#ad"
aliases:
  - GPO processing order
---
Local > Site > Domain > OU (Parent > Sub)

1. The local GPO is applied.
2. GPOs linked to sites are applied.
3. GPOs linked to domains are applied.
4. GPOs linked to organizational units are applied. For nested organizational units, GPOs linked to parent organizational units are applied before GPOs linked to child organizational units are applied.

---
# references:
[Group Policy Hierarchy | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/policy/group-policy-hierarchy)