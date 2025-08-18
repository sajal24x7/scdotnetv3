---
title: "How to show password passed using secure password"
slug: "how-to-show-password-passed-using-secure-password"
pubDate: 2025-08-18T15:15:48+03:00
updatedDate: 2025-08-18T15:15:48+03:00
category: til
tags:
  - powershell

---
Mostly for troubleshooting
```powershell
# if $ADCreds is the created password credential variable

$ADCreds.GetNetworkCredential().password

```

---
# references: