---
title: Windows Enable Quota
slug: windows-enable-quota
created: '2022-11-03T12:14:00+03:00'
updated: '2022-11-03T12:14:00+03:00'
category: til
tags: []
---


1. Open the disk properties window, on which you want to enable quotas, go to the **Quota** tab. Then click **Show Quota Settings**:
2. To enable the quotas for this volume, check **Enable quota management**.
3. **Deny disk space to users exceeding quota limit** – prevent users who have exceeded the quota limit from writing to disk;
4. **Limit disk space to** — set a limit on the total size of files for one user;
5. Click on the **Quota Entries** button. You will see a resulting table showing quotas and the current size of the space used by each user (whose files are found on file system)
6. You must disable quotas for the system accounts NT Service\TrustedInstaller and [NT AUTHORITY\SYSTEM](http://woshub.com/runas-localsystem-account-windows/), otherwise Windows may not work correctly.

---
references:
[How to Enable and Configure User Disk Quotas in Windows? | Windows OS Hub (woshub.com)](http://woshub.com/using-ntfs-disk-quotas-to-set-limits-for-users/)