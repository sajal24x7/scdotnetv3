---
title: VMware VM Serial Number
slug: vmware-vm-serial-number
pubDate: '2024-01-29T13:30:00+03:00'
updatedDate: '2024-01-29T13:30:00+03:00'
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