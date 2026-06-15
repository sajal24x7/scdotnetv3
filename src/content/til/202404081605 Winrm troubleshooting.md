---
title: Winrm Troubleshooting
slug: winrm-troubleshooting
created: '2024-04-08T16:05:00+03:00'
updated: '2024-04-08T16:05:00+03:00'
category: til
tags:
- windows
- winrm
---

Related to [[202309181318 Powershell second hop problem]]

```powershell
# Check credssp setting
## Working example:
Get-WSManCredSSP

The machine is configured to allow delegating fresh credentials to the following target(s): wsman/*

This computer is configured to receive credentials from a remote client computer.


## Not working

Get-WSManCredSSP

The machine is not configured to allow delegating fresh credentials.

This computer is configured to receive credentials from a remote client computer.

```

```powershell
## Check winrm status
winrm get winrm/config
```


---
# references:
[Multi-Hop Support in WinRM - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/winrm/multi-hop-support)
[Installation and configuration for Windows Remote Management - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/winrm/installation-and-configuration-for-windows-remote-management)