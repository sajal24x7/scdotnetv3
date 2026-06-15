---
title: Windows Gives Continue Dialog Box Even If We Have Existing Permissions
slug: windows-gives-continue-dialog-box-even-if-we-have-existing-permissions
created: '2024-04-18T16:35:00+03:00'
updated: '2024-04-18T16:35:00+03:00'
category: til
tags:
- windows
- ntfs
- evergreen
---

This is a known issue.

# Issue description
- You have permission to the share/folder as admin
- However when you go and try to access the folder in explorer, it gives a dialog to click continue to permanently get access
- This modifies NTFS permissions and adds your individual ID to the permissions.
- This can overwrite NTFS permissions so not a good thing.

# Workaround:
Using PowerShell for example it is possible to get acl or delete any files or directories without adding your ID.

---
# references:
[Continue dialog box for folder access in Windows Explorer when user only has access with elevated token - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/dont-have-permission-access-folder#known-issues)