---
title: Powershell Issues with Returned Values from Remote Sessions
slug: powershell-issues-with-returned-values-from-remote-sessions
pubDate: '2022-09-26T12:27:00+03:00'
updatedDate: '2022-09-26T12:27:00+03:00'
category: til
tags:
- powershell
---

## Issue Description

In case of using Get-Child/Get-ChildItem to return registry values, the returned output is formatted according to the local system even if you ran the command remotely. [^1]

This behaviour is because of the fact that PowerShell returns a calculated Property value alongside the Get-Item/Get-ChildItem values. This is useful when running the command locally, but when running the command remotely, the returned output is compared against the local copy of the registry. This causes issues, as referenced in [1] and also when developing the script to get proxy details.

## Cause
The root cause is a bug in the formatting instructions for registry keys (as of Windows PowerShell 5.1.18362.125 and PowerShell Core 7.0.0-preview.2) leading to the unexpected mix of remote and local information - see [this GitHub issue](https://github.com/PowerShell/PowerShell/issues/10341).

  

From the bottom of $PSHOME\Registry.format.ps1xml for type Microsoft.Win32.RegistryKey:

  

``` PowerShell

<ScriptBlock>

  $result = (Get-ItemProperty -LiteralPath $_.PSPath |

      Select * -Exclude PSPath,PSParentPath,PSChildName,PSDrive,PsProvider |

      Format-List | Out-String | Sort).Trim()

  $result = $result.Substring(0, [Math]::Min($result.Length, 5000) )

  if($result.Length -eq 5000) { $result += "..." }

  $result

</ScriptBlock>

```

  

### Fix/Work-around

  

1. When returning output, you can either return only the values you require as a custom PS custom object.

2. Use `| fl*`

3. In my case, run all the queries as part of script block. Create a PS Custom object with values I require, and then return it after everything is done.

---
references:
[1]: (StackOverflow Post)<https://stackoverflow.com/questions/57400948/invoke-command-on-remote-session-returns-local-values>