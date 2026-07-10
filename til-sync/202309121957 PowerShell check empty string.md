---
tags:
  - "#powershell"
aliases: []
---

```Powershell

# Use the IsNullOrEmpty/IsNullOrWhiteSpace string method
[string]::IsNullOrEmpty(...)
[string]::IsNullOrWhiteSpace(...)

## Example to check string
if ([string]::IsNullOrWhiteSpace($User))

```

## Remove leading and trailing space

```powershell

# Use the .Trim() method

```

---
# references:
[.net - How can I check if a string is null or empty in PowerShell? - Stack Overflow](https://stackoverflow.com/questions/13738634/how-can-i-check-if-a-string-is-null-or-empty-in-powershell)
[PowerTip: Remove Leading and Trailing Spaces with PowerShell - Scripting Blog (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-remove-leading-and-trailing-spaces-with-powershell/)