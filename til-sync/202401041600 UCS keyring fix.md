---
aliases:
  - UCS keyring fix
tags:
  - "#ucs"
category: til
updated: 2026-08-25T14:30:56
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