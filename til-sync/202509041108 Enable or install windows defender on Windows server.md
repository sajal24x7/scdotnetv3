---
tags:
  - windows
  - defender
  - av
aliases:
  - Enable or install windows defender on Windows server
category: til
---
```powershell
# Get feature status and find Windows-Defender
Get-WindowsFeature

# Intall using
Install-WindowsFeature -Name 'Windows-Defender'

```