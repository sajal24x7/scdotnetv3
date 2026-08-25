---
aliases:
  - Ansible inventory
tags:
  - "#ansible"
category: til
updated: 2026-08-25T14:30:56
---
# Host groups
Two host groups always exist:
-   The `all` host group contains every host explicitly listed in the inventory
-   The `ungrouped` host group contains every host explicitly listed in the inventory that is not a member of any other group.

### Nested groups
Specified by using `:children` suffix.
Example:
```ansible
[usa]
washington1.example.com
washington2.example.com

[canada]
ontario01.example.com
ontario02.example.com

[north-america:children]
canada
usa
```

# Default location
`/etc/ansible/hosts`

To override use the `-i` switch.


# Commands

```ansible
# To list ungrouped hosts
ansible ungrouped --list-hosts


```


---
# references: