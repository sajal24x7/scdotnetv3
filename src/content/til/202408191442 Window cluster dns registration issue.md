---
title: Window cluster dns registration issue
slug: window-cluster-dns-registration-issue
pubDate: '2024-08-19T14:42:00+03:00'
updatedDate: '2024-08-19T14:42:00+03:00'
category: til
tags:
- windows
- cluster
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