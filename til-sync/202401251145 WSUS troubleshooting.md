---
tag:
aliases:
---
```powershell
Get-WindowsUpdateLog
```

# Troubleshooting steps - client

## Check hard drive space

## Check connectivity
```powershell
Test-NetConnection -ComputerName <WSUS_Server> -Port 8530
```
## WSUS settings
```powershell
Get-ItemProperty HKLM:\Software\Policies\Microsoft\Windows\WindowsUpdate
```

## Check event log
```text
Application Event log as well as App and Service Logs > Microsoft > Windows > WindowsUpdateClient
```  

## Reregister client with wsus
```cmd
gpupdate /force
wuauclt /detectnow

## Sometimes
wuauclt.exe /resetauthorization /detectnow
```


# Troubleshooting problems - server

## IIS Logs location
```text
c:\inetpub\logfiles
```

---
# references:
[WSUS Troubleshooting Steps | Arnaud Loos](https://arnaudloos.com/2019/wsus-troubleshooting/)
[Common Windows Update errors - Windows Client | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-client/deployment/common-windows-update-errors)
[WSUS Messages and Troubleshooting Tips | Microsoft Learn](https://learn.microsoft.com/en-gb/windows-server/administration/windows-server-update-services/manage/wsus-messages-and-troubleshooting-tips)
[Troubleshoot software update scan failures - Configuration Manager | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/configmgr/update-management/troubleshoot-software-update-scan-failures)
