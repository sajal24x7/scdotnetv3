---
title: Ansible Inventory
slug: ansible-inventory
created: '2022-12-22T13:08:00+03:00'
updated: '2022-12-22T13:08:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754731924147024'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkl3zesh2l'
---


# Host groups
Two host groups always exist:
-   The `all` host group contains every host explicitly listed in the inventory
-   The `ungrouped` host group contains every host explicitly listed in the inventory that is not a member of any other group.

### Nested groups
Specified by using `:children` suffix.
Example:
```yaml
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

```yaml
# To list ungrouped hosts
ansible ungrouped --list-hosts


```


---
# references:
