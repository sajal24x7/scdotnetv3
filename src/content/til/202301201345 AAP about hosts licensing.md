---
title: AAP About Hosts Licensing
slug: aap-about-hosts-licensing
created: '2023-01-20T13:45:00+03:00'
updated: '2023-01-20T13:45:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754735732840900'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkmu2zxz2w'
---


If you have multiple hosts in your inventory that have the same name, such as `webserver1`, they count for licensing purposes as a single node. Note that this differs from the Hosts count on the Dashboard, which counts hosts in separate inventories separately. Note that this behavior is case-sensitive; `webserver1` and `WebServer1` are treated as different nodes.

In the automation controller web UI, click Settings in the left pane and select Subscription settings from the Settings page to verify how many hosts your license supports and how many are remaining.

---
# references:
