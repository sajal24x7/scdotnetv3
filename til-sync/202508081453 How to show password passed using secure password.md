---
aliases:
  - How to show password passed using secure password
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
Mostly for troubleshooting
```powershell
# if $ADCreds is the created password credential variable

$ADCreds.GetNetworkCredential().password

```

---
# references: