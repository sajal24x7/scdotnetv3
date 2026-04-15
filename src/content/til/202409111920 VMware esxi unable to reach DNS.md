---
title: VMware esxi unable to reach DNS
slug: vmware-esxi-unable-to-reach-dns
pubDate: '2024-09-11T19:20:00+03:00'
updatedDate: '2024-09-11T19:20:00+03:00'
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