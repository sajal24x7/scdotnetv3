---
title: PowerShell numbers
slug: powershell-numbers
pubDate: '2022-06-10T10:44:00+03:00'
updatedDate: '2022-06-10T10:44:00+03:00'
category: til
tags:
- powershell
---


# Int32
**Int** is the default numeric data type in Windows PowerShell. It is a 32-bit signed integer. The .NET Framework class is System.Int32. Because it is the default numeric data type, I can use [int32] or [int].
To get max and min values:
```powershell
[int]::MaxValue
2147483647
[int]::MinValue
-2147483648
```

---
references:
[Understanding Numbers in PowerShell - Scripting Blog (microsoft.com)](https://devblogs.microsoft.com/scripting/understanding-numbers-in-powershell/#:~:text=%2065535%20Int%20is%20the%20default%20numeric%20data,%5Bint%5D.%20There%20is%20also%20an%20unsigned%2032-bit%20integer.)