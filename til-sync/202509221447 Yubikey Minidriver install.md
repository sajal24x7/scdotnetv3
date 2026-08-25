---
aliases:
  - Yubikey Minidriver install
tags:
  - "#windows"
  - "#yubikey"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

# Quiet instal
msiexec /i YubiKey-Minidriver-5.0.1.272-x64.msi /quiet

# To verify install
Get-WindowsDriver -Online | where {($_.ProviderName -like "Yubico") -and ($_.ClassName -like "SmartCard") -and ($_.Version -like "*")} | select ProviderName,ClassName,Version
```