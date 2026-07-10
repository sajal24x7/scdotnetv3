---
tags:
  - windows
  - upgrade
aliases:
category: til
---

# Error
`Setupdiag reports Optional Component installation failed to open the OC package.`
Already checked the windows modules installer server and ensure it is automatic and running. Upgrade continues to fail
# Issue
Missing foundation packages from the server. This registry key was empty = `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\Packages`

# Fix

## Method 1 
1. Go to a healthy server.
2. Run the following and check that `Microsoft-Windows-Foundation-Package` is present.
```cmd
dism /online /get-packages /format:table
```

3. Also check at `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\Packages`, export the Packages key.
4. Go to the failing machine, and merge this .reg file.
5. Verify that the merge was successful.
6. Retry the upgrade.

## Method 2 - In place repair

### Some points
In-place upgrade will only replace the contents of the C:\Windows folder. 
- This is a non-destructive process as it does not alter/delete any user profiles, files and programs.  
- You do not have to restore anything from the backup. This is because any programs/applications are installed either in C:\ProgramFiles or C:\ProgramFilesx86 which are outside C:\Windows folder. (but taking a backup is recommended) 

Please note however, that in-place upgrade will delete all your windows update, and we would have to install the updates again. (Since the update is cumulative, you only need to install the latest one to resolve the issues.)

From [In-place upgrade recommendations](https://learn.microsoft.com/en-us/mem/configmgr/osd/understand/in-place-upgrade-recommendations "https://learn.microsoft.com/en-us/mem/configmgr/osd/understand/in-place-upgrade-recommendations") -  
- If this is a DC, you need to demote the machine to a domain member.
- If you have IIS installed on this, you need to remove IIS and reinstall once the OS is back up. 

1. Please prepare and download Window Server 2016 ISO image at: [Microsoft 365 admin center](https://admin.microsoft.com/adminportal/home#/subscriptions/vlnew "https://admin.microsoft.com/adminportal/home#/subscriptions/vlnew") or from the original ISO provider you choose to download when first install Window Server 2016.
2. Double click the “Setup” of the mounted WS 2016 image
3. Select Yes to start the setup process.
4. For internet-connected devices, select the Download updates, drivers and optional features (recommended) option, and then select Next.
5. Setup checks your device configuration, you must wait for it to finish, and then select Next.
6. Select the Windows Server 2016 edition you want to install, and then select Next.
7. Select Accept to accept the terms of your licensing agreement, based on your distribution channel (such as, Retail, Volume License, OEM, ODM, and so on).
8. Select Keep personal files and apps to choose to do an in-place upgrade, and then select Next.
9. If you see a page that tells you upgrade isn't recommended, you can ignore it and select Confirm. It was put in place to prompt for clean installations, but it isn't necessary.
10. Setup will tell you to remove Microsoft Endpoint Protection using Add/Remove programs.
11. After Setup analyzes your device, it will prompt you to proceed with your upgrade by selecting Install.
12. The in-place upgrade starts, showing you the Upgrading Windows screen with its progress. After the upgrade finishes, your server will restart.
13. After your upgrade completes, continue to upgrade with the 2019 ISO using the same method.