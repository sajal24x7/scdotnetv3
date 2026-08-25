---
aliases:
  - VMware VM serial number
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
```powercli
$VM = Get-VM 7ocilpipaap01
$VM.ExtensionData.Config.UUid
```

This has the serial number.

---
# references: