---
title: Openssh on Windows Failing With 0x80072ee2
slug: openssh-on-windows-failing-with-0x80072ee2
created: '2023-06-21T17:51:00+03:00'
updated: '2023-06-21T17:51:00+03:00'
category: til
tags:
- windows
- powershell
---


Download from https://github.com/PowerShell/Win32-OpenSSH/releases/

Error: 
```txt
PS C:\Windows\system32> Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Add-WindowsCapability : Add-WindowsCapability failed. Error code = 0x80072ee2
At line:1 char:1
+ Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [Add-WindowsCapability], COMException
    + FullyQualifiedErrorId : Microsoft.Dism.Commands.AddWindowsCapabilityCommand
```

Cause: Required files are not present.

# Fix/Steps to install

1. Attach ISO.
2. Run powershell per below
```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0 -LimitAccess -Source Z:\LanguagesAndOptionalFeatures

# Start the sshd service
Start-Service sshd

# OPTIONAL but recommended:
Set-Service -Name sshd -StartupType 'Automatic'
```

# Uninstall
```powershell
# Uninstall the OpenSSH Client
Remove-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Uninstall the OpenSSH Server
Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

# Configuration
Configuration file is created here

```text
%programdata%\ssh\sshd_config
```
### Port and IP binding

1.       Open the file and uncomment Port and provide the custom port required.
2.       Uncomment ListenAddress and provide clustered role IP. This binds the SSH to that IP.

### Default directory
1.       Set ChrootDirectory to whatever default location is needed.

### Authorized groups

1.       Use AllowGroups to allow whatever group needs access. By default add Administrators.

Additional configuration is not in scope of this document. Refer to man page for the list of configuration and how to setup authentication.


---
# references:
[Get started with OpenSSH for Windows | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse?tabs=powershell#uninstall-openssh-for-windows)