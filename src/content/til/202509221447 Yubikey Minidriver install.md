---
title: "Yubikey Minidriver Install"
slug: "yubikey-minidriver-install"
created: 2025-09-22T14:47:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["windows", "yubikey", "powershell"]
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