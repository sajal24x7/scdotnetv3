---
title: "How to Show Password Passed Using Secure Password"
slug: "how-to-show-password-passed-using-secure-password"
created: 2025-08-08T14:53:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoelfunr26'
  - 'https://mastodon.social/@sajal24x7/116756408549822798'
---
Mostly for troubleshooting
```powershell
# if $ADCreds is the created password credential variable

$ADCreds.GetNetworkCredential().password

```

---
# references: