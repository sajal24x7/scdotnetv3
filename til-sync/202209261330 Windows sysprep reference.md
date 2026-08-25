---
aliases:
  - Windows sysprep
  - Sysprep
  - Windows image prep
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
Located: %WINDIR%\system32\sysprep\sysprep.exe

```cmd
%WINDIR%\system32\sysprep\sysprep.exe /generalize /shutdown /oobe
```

Sysprep will remove language location settings, etc.  
So let the server boot up, select region. Then shutdown and convert it to template.\

After bootup:
1. Select region
2. Remove IP
3. Remove any groups from local groups
4. Also cleanup all logs

```powershell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }
```

---
references:
[Sysprep (Generalize) a Windows installation | Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/sysprep--generalize--a-windows-installation?view=windows-11)
[Boot Windows to Audit Mode or OOBE | Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/boot-windows-to-audit-mode-or-oobe?view=windows-11)