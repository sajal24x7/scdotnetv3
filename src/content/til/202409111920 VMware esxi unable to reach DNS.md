---
title: VMware Esxi Unable to Reach DNS
slug: vmware-esxi-unable-to-reach-dns
created: '2024-09-11T19:20:00+03:00'
updated: '2024-09-11T19:20:00+03:00'
category: til
tags:
- vmware
- dns
---

1. Check that DNS configuration is correct.
2. In dcui view, test management network, whether dns resolution works or not
3. Check the firewall configuration for dns. It needs to be selected in rules, then it will be enabled.

---
# references: