---
title: Window Cluster Dns Registration Issue
slug: window-cluster-dns-registration-issue
created: '2024-08-19T14:42:00+03:00'
updated: '2024-08-19T14:42:00+03:00'
category: til
tags:
  - windows
  - cluster
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo67atnx2l'
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
