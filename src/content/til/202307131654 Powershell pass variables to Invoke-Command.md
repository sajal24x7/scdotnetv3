---
title: Powershell Pass Variables to Invoke-Command
slug: powershell-pass-variables-to-invoke-command
pubDate: '2023-07-13T16:54:00+03:00'
updatedDate: '2023-07-13T16:54:00+03:00'
category: til
tags:
- powershell
---


Refer to local variable with $using

Use the '$using:' scope

```powershell
$Using:variablename
```

---
# references:
[about Scopes - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_scopes?view=powershell-7.2#scope-modifiers)
[PowerShell: Passing variables to remote commands (powershellexplained.com)](https://powershellexplained.com/2016-08-28-PowerShell-variables-to-remote-commands/)