---
tag: #windows, #powershell
aliases:
---

```powershell
Get-CimInstance -ClassName win32_operatingsystem | select csname, lastbootuptime
```

---
# references:
[PowerTip: Get the Last Boot Time with PowerShell - Scripting Blog (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-the-last-boot-time-with-powershell/)