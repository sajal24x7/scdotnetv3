---
tags:
  - "#windows"
aliases:
  - Reset RDS 120 days window
  - Reset RDP 120 days window
---
1. On the RDS session host, launch Registry Editor (regedit) as an administrator.
2. In regedit, browse to `**HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\GracePeriod**`.
3. Within this registry key is a `REG_BINARY` entry whose name begins with the string `**L$RTMTIMEBOMB**`. (This is likely the only entry in this key.) The default permissions on this entry do not allow it to be modified or deleted, so these permissions must be changed.
4. Right-click the **GracePeriod** folder in the left pane of regedit and select **Permissions**.
5. In the permissions window that appears, select **Administrators**, and assign this group **Full Control** permissions. Click **OK** to close the window.
6. If an error indicates that the permissions could not be changed, take ownership of the folder by following these steps:
    1. If the permissions window is no longer open, right-click the **GracePeriod** folder and select **Permissions** again.
    2. Click **Advanced**.
    3. At the top of the Advanced Security Settings window, Click the **Change** link next to the current owner.
    4. Type **Administrators** in the blank and click **Check Names**. Confirm that the local Administrators group is listed and click **OK**.
    5. Check the box labeled **Replace owner on sub containers and objects** and click **OK**.
    6. Click **OK** again to close the permissions window, then attempt to change the permissions of the folder again.
7. Right-click the **`L$RTMTIMEBOMB`...** registry entry and select **Delete**. Click **Yes** to confirm the deletion.
8. Exit regedit.
9. Reboot the session host server in order for the registry change to take effect.

---
# references:
	