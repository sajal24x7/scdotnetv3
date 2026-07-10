---
tags:
  - "#windows"
  - "#cluster"
aliases:
---
# Error
>Cluster network name resource ‘Cluster Name’ failed registration of one or more associated DNS name(s) for the following reason: DNS bad key.

Cluster object OK. Cluster role also OK. DNS entry not present.

# Fix
Checked the NIC. No issues there.
Unchecked register DNS option.
Close the network config.
Go again and recheck it.


---
# references: