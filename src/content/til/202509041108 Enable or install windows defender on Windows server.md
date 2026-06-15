---
title: Enable or Install Windows Defender on Windows Server
slug: enable-or-install-windows-defender-on-windows-server
created: 2025-09-08T17:51:25.000Z
updated: 2025-09-08T17:51:25.000Z
category: til
tags:
  - windows
  - defender
  - av
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoexvttt2m'
  - 'https://mastodon.social/@sajal24x7/116756409546929826'
---
```powershell
# Get feature status and find Windows-Defender
Get-WindowsFeature

# Intall using
Install-WindowsFeature -Name 'Windows-Defender'

```
