---
title: Yubikey Minidriver install
slug: yubikey-minidriver-install
pubDate: 2025-12-18T10:32:33.000Z
updatedDate: 2025-12-18T10:32:33.000Z
category: til
tags:
  - windows
  - yubikey
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115740128756097915'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3maay6ytp3u2r'
  - 'https://www.threads.com/@sajal24x7/post/DSZtUyKjprL'
---
```powershell

# Quiet instal
msiexec /i YubiKey-Minidriver-5.0.1.272-x64.msi /quiet

# To verify install
Get-WindowsDriver -Online | where {($_.ProviderName -like "Yubico") -and ($_.ClassName -like "SmartCard") -and ($_.Version -like "*")} | select ProviderName,ClassName,Version
```
