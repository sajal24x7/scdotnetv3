---
title: Use Managed Service Account for Scheduled Task
slug: use-managed-service-account-for-scheduled-task
created: '2024-03-25T11:52:00+03:00'
updated: '2024-03-25T11:52:00+03:00'
category: til
tags:
- windows
- ad
- powershell
---


# Pre-requisites
1. Add managed service account to groups/provide access on server as needed
2. Add service account to Logon as batch job

## Add service account to Logon as batch job
1. Go to gpedit
2. Computer Configuration > Windows Settings > Security Settings > Local Policies > User Rights Assignment
3. Add account to Logon as a batch job
# Steps
## Add service account to server
```powershell
Install-AdServiceAccount <gMSA>

Test-AdServiceAccount <gMSA>
```

## Add service account to scheduled task
This needs to run as powershell. It is not possible to set it in UI.

```powershell
> $principal = New-ScheduledTaskPrincipal -UserID domain\account$ -LogonType Password  
  
> Set-ScheduledTask -TaskName "DNS monitoring" -Principal $principal  
  
TaskPath TaskName State  
-------- -------- -----  
\ DNS monitoring Ready
```


---
# references: