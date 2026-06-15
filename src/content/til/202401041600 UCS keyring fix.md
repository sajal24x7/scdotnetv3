---
title: UCS Keyring Fix
slug: ucs-keyring-fix
created: '2024-01-04T16:00:00+03:00'
updated: '2024-01-04T16:00:00+03:00'
category: til
tags:
  - ucs
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754758093643981'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkwyyyfa2u'
---

Issue:
default Keyring's certificate is invalid, reason: expired.

Fix:

```bash 
scope security
scope keyring default
set regenerate yes
set modulus mod2048
commit-buffer
```

---
# references:
