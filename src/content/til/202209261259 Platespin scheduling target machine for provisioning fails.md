---
title: Platespin Scheduling Target Machine for Provisioning Fails
slug: platespin-scheduling-target-machine-for-provisioning-fails
pubDate: '2022-09-26T12:59:00+03:00'
updatedDate: '2022-09-26T12:59:00+03:00'
category: til
tags: []
---


Scheduling target machine for provisioning fails with
NPART Error: code=28 msg=Device sdb does not have enough free space. (No space left on device)

On the target VM, press:
Alt F2     
or  
CTRL ALT F2.
At the prompt press 0 to go to a shell. Once you are at the shell run the following commands:
```bash
dd if=/dev/zero of=/dev/sda  bs=512M count=1 conv=sync
dd if=/dev/zero of=/dev/sdb  bs=512M count=1 conv=sync
dd if=/dev/zero of=/dev/sdc  bs=512M count=1 conv=sync
```

Once that is complete please reboot the target, run the discovery again and let me know if you still are running into a problem partitioning the target volumes.

---
references: