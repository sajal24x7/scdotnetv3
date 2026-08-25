---
aliases:
  - Troubleshoot Entra Connect Issues
tags:
  - "#entraconnect"
category: til
updated: 2026-08-25T14:30:56
---
``` powershell

Import-Module ADSyncDiagnostics
Invoke-ADSyncDiagnostics -PasswordSync

```

# Example

Issue when password hash synchronization was set as Disabled and Entra connect health was in error state after [[202408271224 Migrate Entra Connect DB|Migrate Entra Connect DB]]

```powershell
PS C:\Program Files\Microsoft Azure Active Directory Connect> Invoke-ADSyncDiagnostics -PasswordSync
Staging mode is enabled. Password Hash Synchronization does not work when staging mode is enabled.
```


---
# references:
[Troubleshoot password hash synchronization with Microsoft Entra Connect Sync - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/tshoot-connect-password-hash-synchronization#no-passwords-are-synchronized-troubleshoot-by-using-the-diagnostic-cmdlet)