---
aliases:
  - Enable or disable lockdown mode on vcenter
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
#To enable Lockdown mode using PowerCLI, run this command:  
 
(get-vmhost <hostname> | get-view).EnterLockdownMode() | get-vmhost | select Name,@{N="LockDown";E={$_.Extensiondata.Config.adminDisabled}} | ft -auto

  
#To disable Lockdown mode, run this command:  
  
(get-vmhost _<hostname>_ | get-view).ExitLockdownMode()  
  
#To batch modify Lockdown mode using PowerCLI, save this text in a *.PS1 file and run with PowerCLI:

$vCenter = '_vCenterServer_Name_or_IP_address_'

Connect-VIServer $vCenter

$Scope = Get-VMHost #This will change the Lockdown Mode on all hosts managed by vCenter

foreach ($ESXhost in $Scope) {

(get-vmhost $ESXhost | get-view).ExitLockdownMode() # To DISABLE Lockdown Mode

#(get-vmhost $ESXhost | get-view).EnterLockdownMode() # To ENABLE Lockdown Mode

}

Disconnect-VIServer -Server $vCenter -Confirm:$false
```

---
# references:
[Enabling or disabling Lockdown mode on an ESXi host (broadcom.com)](https://knowledge.broadcom.com/external/article/336894/enabling-or-disabling-lockdown-mode-on-a.html)