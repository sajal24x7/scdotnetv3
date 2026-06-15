---
title: PowerShell Arrays
slug: powershell-arrays
created: '2022-04-12T15:31:00+03:00'
updated: '2022-04-12T15:31:00+03:00'
category: til
tags:
- powershell
---


# How to create arrays
An empty array can be created by using `@()`

Example array:
```powershell
$ExampleArray = @(
	"C:\test",
	"C:\test2"
)
```

---
references:
1. [Everything you wanted to know about arrays - PowerShell | Microsoft Docs](https://docs.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-arrays?view=powershell-7.2)