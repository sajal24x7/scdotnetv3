---
title: Ansible Variable Precedence
slug: ansible-variable-precedence
created: '2022-04-25T17:17:00+03:00'
updated: '2022-04-25T17:17:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhninbwh2m'
---


In the order:
1. Extra vars
2. Play vars
3. Host vars
4. Group vars

---
references:

```learn
prompts:
  - q: Ansible variable precedence, highest to lowest?
    a: Extra vars → play vars → host vars → group vars.
  - q: The same variable is set in host_vars and group_vars for a host — which value wins?
    a: host_vars — host variables beat group variables.
```
