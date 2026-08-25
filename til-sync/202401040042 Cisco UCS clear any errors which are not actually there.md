---
aliases:
  - Cisco UCS clear any errors which are not actually there
tags:
  - "#ucs"
category: til
updated: 2026-08-25T14:30:56
---
Go to Service Profile > General > Recover Server > Reset CIMC (Server Controller)

This does not affect the server and just verifies everything. 
This is useful when NIC might show down but actually no issues observed for the server. 
flogi-table might have missing entries.
Happened after an infrastructure firmware upgrade.

---
# references: