---
title: How to Get Service Config in Linux
slug: how-to-get-service-config-in-linux
created: 2026-10-24T07:23:00.000Z
updated: 2026-10-24T07:30:05.000Z
category: til
tags:
  - linux
  - service
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117495526596939408'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mymjvjedzg2h'
  - 'https://www.threads.com/@sajal24x7/post/De3-ICkFn1E'
---
1. Use systemctl

```bash
## all properties of the service
systemctl show kubelet | grep -i config

## show the unit file and any overrides
systemctl cat kubelet
```
