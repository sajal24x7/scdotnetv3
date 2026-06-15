---
title: About System Volume Information
slug: about-system-volume-information
created: 2025-02-18T08:41:45.000Z
updated: 2025-02-18T08:41:45.000Z
category: til
tags:
  - '#windows'
  - '#powershell'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modocmpd2l2m'
  - 'https://mastodon.social/@sajal24x7/116756404237359608'
---
```powershell
# Take ownership
takeown /f "C:\System Volume information"  

# Grant permission
icacls "C:\System Volume Information" /grant domain\user:F

## Revert
icacls "C:\System Volume Information" /setowner "NT Authority\System"
icacls "C:\System Volume Information" /remove domain\user

```

System Volume Information drives usually contain snapshot. 
[Windows delete shadow copies](#)

---
# references:
[How to Clean Up System Volume Information Folder on Windows | Windows OS Hub](https://woshub.com/how-to-clean-up-system-volume-information-folder/)
