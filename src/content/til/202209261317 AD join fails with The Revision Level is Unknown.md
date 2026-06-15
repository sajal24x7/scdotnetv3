---
title: AD Join Fails With the Revision Level Is Unknown
slug: ad-join-fails-with-the-revision-level-is-unknown
created: '2022-09-26T13:17:00+03:00'
updated: '2022-09-26T13:17:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkdm5w7r2m'
---

When trying to join to workgroup, or join domain, we get the message: 
"The Revision Level is Unknown"

To workaround this behavior:

1.   Log on locally with Administrator privileges.
2. Use the registry Editor to grant the your account Full Control of the HKEY_LOCAL_MACHINE\SECURITY\Policy\Secrets\$MACHIN E.ACC registry key.
3. Delete the HKEY_LOCAL_MACHINE\SECURITY\Policy\Secrets\$MACHIN E.ACC registry key.
4. Shutdown and restart your computer.
5. Log on locally with Administrator privileges.
6. Join a WORKGROUP and restart your computer.
7. Log on locally with Administrator privileges.
8. Join your domain.
9. Shutdown and restart your computer.
10. Logon to your domain.

Note:

The registry HKEY_LOCAL_MACHINE\SECURITY might not have anything visible with the local account you use to login. In order to workaround that:
1. Download PSTools (https://download.sysinternals.com/files/PSTools.zip)
2. Extract.
3. Run:
```cmd
psexec -i -s c:\windows\regedit.exe
```
4. Then do the above workaround.

---
references:
