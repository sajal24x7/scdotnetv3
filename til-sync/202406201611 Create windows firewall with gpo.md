---
aliases:
  - Create windows firewall with gpo
tags:
  - "#windows"
  - "#gpo"
  - "#Firewall"
category: til
updated: 2026-08-25T14:30:56
---
# Configure firewall service

1. **Computer Configuration** > **Policies** > **Windows Settings** > **Security Settings** > **System Services**. Find **Windows Firewall** in the list of services and change the startup type to Automatic (Define this policy setting -> Service startup mode Automatic).
2. **Computer Configuration** > **Policies** > **Administrative Templates** > **Network** > **Network Connections** > **Windows Defender** > **Firewall** > **Domain Profile** and enable the policy Windows Defender Firewall: Protect all network connections.
3. **Computer Configuration** > **Windows Settings** > **Security Settings** section. Right-click **Windows Firewall with Advanced Security** and open the properties. Make sure to enable the **Firewall State** to On(Recommended) on each of the profiles you will be using (enabling on all is best practice).

# Configure firewall rules
**Computer Configuration** > **Policies** > **Windows Settings** > **Security Settings** > **Windows Firewall with Advanced Security.**
1. You can use custom to specify port and remote address and app as well.

We need the following information:
```csv
Remote Address,App,Protocol,Port,Purpose
```

App can be any (basically .exe path needs to be provided)

---
# references:
[How To Manage Windows Firewall with GPOs | Blumira](https://www.blumira.com/windows-firewall-with-gpos/)