---
tags:
  - "#ad"
  - "#windows"
  - "#powershell"
aliases:
  - How to install AD
  - how to configure ad
---
After completing [[202412111622 AD pre-requisites]], for first dc in domain.

1. Install ADDS role.
```powershell
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
```
2. Install forest.
```powershell
Install-ADDSForest -DomainName "rebeladmin.com" -CreateDnsDelegation:$false -DatabasePath "C:\Windows\NTDS" -DomainMode "7" -DomainNetbiosName "REBELADMIN" -ForestMode "7" -InstallDns:$true -LogPath "C:\Windows\NTDS" -NoRebootOnCompletion:$True -SysvolPath "C:\Windows\SYSVOL" -Force:$true
```
3. Once executed, the command will prompt you for the **SafeModeAdministratorPassword**. This is used in **Directory Services Restore Mode** (**DSRM**).
4. After command is done, reboot and login as domain admin. 
5. Check ad status. 


For additional DCs, after install you can [[202412051521 Moving fsmo roles|move fsmo roles]]

---
# references: