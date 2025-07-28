---
title: Cisco UCS clear any errors which are not actually there
slug: cisco-ucs-clear-any-errors-which-are-not-actually-there
pubDate: '2024-01-04T00:42:00+03:00'
updatedDate: '2024-01-04T00:42:00+03:00'
category: til
tags:
- ucs
---

Go to Service Profile > General > Recover Server > Reset CIMC (Server Controller)

This does not affect the server and just verifies everything. 
This is useful when NIC might show down but actually no issues observed for the server. 
flogi-table might have missing entries.
Happened after an infrastructure firmware upgrade.

---
# references: