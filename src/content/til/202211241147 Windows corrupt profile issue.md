---
title: Windows Corrupt Profile Issue
slug: windows-corrupt-profile-issue
pubDate: '2022-11-24T11:47:00+03:00'
updatedDate: '2022-11-24T11:47:00+03:00'
category: til
tags: []
---


Event: Windows has backed up this user profile. Windows will automatically try to use the backup profile the next time this user logs on.

# Fix
Requires reboot
1. Get your SID from whoami /user command.
2. Go to the following path: **HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList**.
3. If sid exists with sid and sid.bak. Delete both the folders, one after the other. Logout and login.




	1. Delete sid folder. 
	2. Rename sid.bak to sid. 
	3. Double-click **ProfileImagePath** to modify its value name, enter the correct path of the user profile folder and select **OK**. 
	4. Verify that the **State** DWORD value of the SID key is **0** and then close the Registry Editor.

---
references:
[How to Fix a Corrupt User Profile in Windows 10 (helpdeskgeek.com)](https://helpdeskgeek.com/windows-10/how-to-fix-a-corrupt-user-profile-in-windows-10/)