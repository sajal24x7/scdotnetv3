---
title: VMware VM Serial Number
slug: vmware-vm-serial-number
created: '2024-01-29T13:30:00+03:00'
updated: '2024-01-29T13:30:00+03:00'
category: til
tags:
- vmware
---

```powercli
$VM = Get-VM 7ocilpipaap01
$VM.ExtensionData.Config.UUid
```

This has the serial number.

---
# references: