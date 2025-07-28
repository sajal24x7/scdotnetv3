---
title: Entra Connect PS Module
slug: entra-connect-ps-module
pubDate: '2024-09-16T15:05:00+03:00'
updatedDate: '2024-09-16T15:05:00+03:00'
category: til
tags:
- powershell
- entraconnect
---

```powershell

# ADSYncTOols
Import-module -Name "C:\Program Files\Microsoft Azure Active Directory Connect\Tools\AdSyncTools"

# Health Agent modules

#Under the following path 
# C:\Program Files\Microsoft Azure AD Connect Health Agent\Modules\

Import-Module 'C:\Program Files\Microsoft Azure AD Connect Health Agent\Modules\AdHealthConfiguration\AdHealthConfiguration.psd1'
```



---
# references: