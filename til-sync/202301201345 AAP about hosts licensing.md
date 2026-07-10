---
tags:
  - "#ansible"
aliases:
---

If you have multiple hosts in your inventory that have the same name, such as `webserver1`, they count for licensing purposes as a single node. Note that this differs from the Hosts count on the Dashboard, which counts hosts in separate inventories separately. Note that this behavior is case-sensitive; `webserver1` and `WebServer1` are treated as different nodes.

In the automation controller web UI, click Settings in the left pane and select Subscription settings from the Settings page to verify how many hosts your license supports and how many are remaining.

---
# references: