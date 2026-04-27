---
title: UCS Keyring Fix
slug: ucs-keyring-fix
pubDate: '2024-01-04T16:00:00+03:00'
updatedDate: '2024-01-04T16:00:00+03:00'
category: til
tags:
- ucs
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