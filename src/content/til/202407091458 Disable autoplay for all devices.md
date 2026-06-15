---
title: Disable Autoplay for All Devices
slug: disable-autoplay-for-all-devices
created: '2024-07-09T14:58:00+03:00'
updated: '2024-07-09T14:58:00+03:00'
category: til
tags:
  - windows
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754950661665249'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnokylp42o'
---

# Registry
Registry Hive: HKEY_LOCAL_MACHINE  
Registry Path: \SOFTWARE\Microsoft\Windows\CurrentVersion\policies\Explorer\  
  
Value Name: NoDriveTypeAutoRun  
  
Value Type: REG_DWORD  
Value: 0x000000ff (255)


# GPO
```text
Computer Configuration >> Administrative Templates >> Windows Components >> AutoPlay Policies >> "Turn off AutoPlay" to "Enabled:All Drives".
```


---
# references:
[Autoplay must be disabled for all drives. (stigviewer.com)](https://www.stigviewer.com/stig/windows_10/2019-01-04/finding/V-63673)
