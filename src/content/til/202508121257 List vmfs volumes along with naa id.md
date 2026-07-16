---
title: List Vmfs Volumes Along With Naa Id
slug: list-vmfs-volumes-along-with-naa-id
created: 2025-08-12T09:57:30.000Z
updated: 2025-08-12T09:57:30.000Z
category: til
tags:
  - vmware
  - esxi
  - esxcli
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoemr4xc2m'
  - 'https://mastodon.social/@sajal24x7/116756408715750849'
---
This commands lists naa id, vmfs id and datastore name. We can grep to search for a particular vmfs volume.

```bash
esxcli storage vmfs extent list
```

---
# references:
