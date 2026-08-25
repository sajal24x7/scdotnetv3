---
aliases:
  - Enable or install windows defender on Windows server
tags:
  - "#windows"
  - "#defender"
  - "#av"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
# Get feature status and find Windows-Defender
Get-WindowsFeature

# Intall using
Install-WindowsFeature -Name 'Windows-Defender'

```