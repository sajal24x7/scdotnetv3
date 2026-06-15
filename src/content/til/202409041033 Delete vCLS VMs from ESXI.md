---
title: Delete vCLS VMs From ESXI
slug: delete-vcls-vms-from-esxi
created: '2024-09-04T10:33:00+03:00'
updated: '2024-09-04T10:33:00+03:00'
category: til
tags:
  - vmware
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoajqgub2w'
  - 'https://mastodon.social/@sajal24x7/116756211920497001'
---

Useful when trying to remove datastore from ESXi and the vCLS VM is running on it. 

Putting esxi in MM just shuts off the VM and not delete it.

# Fix
1. Change vCLS Mode to Retreat mode instead of 

---
# references:
