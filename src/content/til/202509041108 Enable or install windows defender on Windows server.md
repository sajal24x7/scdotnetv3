---
title: "Enable or Install Windows Defender on Windows Server"
slug: "enable-or-install-windows-defender-on-windows-server"
pubDate: 2025-09-08T20:51:25+03:00
updatedDate: 2025-09-08T20:51:25+03:00
category: til
tags:
  - windows
  - defender
  - av

---
```powershell
# Get feature status and find Windows-Defender
Get-WindowsFeature

# Intall using
Install-WindowsFeature -Name 'Windows-Defender'

```