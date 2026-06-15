---
title: Run Powershell Command as Scheduled Task
slug: run-powershell-command-as-scheduled-task
created: '2024-07-08T12:01:00+03:00'
updated: '2024-07-08T12:01:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754950366707101'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnogta5i2v'
---


Define action as:

```text
# Action as:
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

# Arguments as : -Command &{} 
-command &{get-process >> c:\fso\ServiceProcessBios.txt; get-service | where{$_.Status -eq ‘Running’} >> c:\fso\ServiceProcessBios.txt; Get-WmiObject Win32_bios >> c:\fso\ServiceProcessBios.txt}

```

---
# references:
[Use Scheduled Tasks to Run PowerShell Commands on Windows - Scripting Blog [archived] (microsoft.com)](https://devblogs.microsoft.com/scripting/use-scheduled-tasks-to-run-powershell-commands-on-windows/)
