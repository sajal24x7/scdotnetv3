---
title: Powershell second hop problem
slug: powershell-second-hop-problem
pubDate: '2023-09-18T13:18:00+03:00'
updatedDate: '2023-09-18T13:18:00+03:00'
category: til
tags:
- powershell
- winrm
---


To fix issue

1. Add fi server entry in etc/hosts so that resolution works
2. Two policies need to be enabled Local Computer Policy -> Computer Configuration -> Administrative Templates -> System -> Credentials Delegation. This cannot be with IP address: 
    1. Enable Allow delegating fresh credentials and set value
    2. Enable Allow delegating fresh credentials with NTLM-only server authentication and set value

---
# references:

[Making the second hop in PowerShell Remoting - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/remoting/ps-remoting-second-hop?view=powershell-5.1)