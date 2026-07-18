---
title: PowerShell Check Empty String
slug: powershell-check-empty-string
created: '2023-09-12T19:57:00+03:00'
updated: '2023-09-12T19:57:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754754568712675'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkvfjmit23'
---


```powershell

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
