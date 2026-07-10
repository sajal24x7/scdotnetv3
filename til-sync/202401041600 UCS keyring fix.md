---
tags:
  - "#ucs"
aliases:
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