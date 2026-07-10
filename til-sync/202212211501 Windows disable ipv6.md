---
tag: #windows, #powershell
aliases:
---

# Powershell
```powershell
Get-NetAdapterBinding | Where-Object ComponentID -EQ 'ms_tcpip6'

Disable-NetAdapterBinding -Name 'Ethernet' -ComponentID 'ms_tcpip6'
```

# Registry

**Location**: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters\`  
**Name**: DisabledComponents  
**Type**: REG_DWORD  
**Min Value**: 0x00 (default value)  
**Max Value**: 0xFF (IPv6 disabled) Decimal 255

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters\" -Name DisabledComponents -Value 255 -PropertyType DWORD -Force
```

---
references:
[How to Disable IPv6 on Windows (adamtheautomator.com)](https://adamtheautomator.com/disable-ipv6/)
[Configure IPv6 for advanced users - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-ipv6-in-windows)