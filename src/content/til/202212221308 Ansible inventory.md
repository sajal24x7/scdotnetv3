---
title: Ansible inventory
slug: ansible-inventory
pubDate: '2022-12-22T13:08:00+03:00'
updatedDate: '2022-12-22T13:08:00+03:00'
category: til
tags:
- ansible
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