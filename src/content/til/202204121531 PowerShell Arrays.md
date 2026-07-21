---
title: PowerShell Arrays
slug: powershell-arrays
created: '2022-04-12T15:31:00+03:00'
updated: '2022-04-12T15:31:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhn5hxmu2l'
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

```learn
syntax: '@()'
prompts:
  - q: In PowerShell, how do you create an empty array?
    a: '$ExampleArray = @()'
  - q: You need a PowerShell array holding several paths — what does the literal look like?
    a: '@("C:\test", "C:\test2") — comma-separated values inside @( )'
```
