---
title: "How to Show Password Passed Using Secure Password"
slug: "how-to-show-password-passed-using-secure-password"
created: 2025-08-08T14:53:48+03:00
updated: 2025-08-08T14:53:48+03:00
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