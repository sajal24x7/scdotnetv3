---
title: "Yubikey Minidriver install"
slug: "yubikey-minidriver-install"
pubDate: 2025-12-18T12:32:33+02:00
updatedDate: 2025-12-18T12:32:33+02:00
category: til
tags:
  - windows
  - yubikey
  - powershell

---
```powershell

# Quiet instal
msiexec /i YubiKey-Minidriver-5.0.1.272-x64.msi /quiet

# To verify install
Get-WindowsDriver -Online | where {($_.ProviderName -like "Yubico") -and ($_.ClassName -like "SmartCard") -and ($_.Version -like "*")} | select ProviderName,ClassName,Version
```