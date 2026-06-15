---
title: How to Configure Entra Connect Sync Filtering
slug: how-to-configure-entra-connect-sync-filtering
created: 2025-09-08T17:51:55.000Z
updated: 2025-09-08T17:51:55.000Z
category: til
tags:
  - azure
  - entra
  - entraconnect
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoeura6r2w'
---
[MSFT has good documentation around this.]([Microsoft Entra Connect Sync: Configure filtering - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-configure-filtering)) 

There are a few filtering options available:
1. Group-based
2. Domain-based
3. OU-based
4. Attribute-based

Our requirement is to not sync some objects having a certain extension attribute. The difference is the cloudFiltered attribute which should be True if you want to filter these objects.

Here are the steps to follow for adding **attribute based inbound filtering**:

# Pre-tasks
1. Disable the synchronization scheduler.

```powershell
Import-Module ADSync
Set-ADSyncScheduler -SyncCycleEnabled $False
```

2.  Enable staging mode.

# Activity
1. Start Synchronization Rules Editor. Make sure inbound is selected and click add new rule.
2. In description, 
	1. Add rule name and description. 
	2. In CS object type, select whatever is required - for example, user.
	3. In MV object type, select relevant item - for example, person for user.
	4. In **Link Type**, select **Join**
	5. In **Precedence**, type a value that isn't currently used by another synchronization rule
3. In scoping filter,
	1. click add group and click Add Clause.
	2. Under Attribute, select the appropriate value, example extensionAttribute1
	3. Under operator, select  the appropriate value, example startswith
	4. Under value specify the value, for example A
	5. Click Next
4. Leave Join rules empty
5. Under Transformations
	1. Click **Add Transformation**, 
	2. select the **FlowType** as **Constant**
	3. select **cloudFiltered** as the **Target Attribute**. 
	4. In the **Source** text box, type **True**. 
	5. Click **Add** to save the rule.

# Apply and verification

1. Do full sync.

```powershell
Start-ADSyncSyncCycle -PolicyType Initial
```

2. After the synchronization, all changes are staged to be exported. Before you actually make the changes in Microsoft Entra ID, you want to verify that all these changes are correct.
3. Start a command prompt, and go to `C:\Program Files\Microsoft Azure AD Sync\bin`.
4. Run the following
```cmd
csexport "Name of Connector" C:\Temp\export.xml /f:x
```
5. Run the following
```cmd
CSExportAnalyzer 'C:\Temp\export.xml' > 'C:\Temp\export.csv'
```

6. The csv contains the changes to be exported.
7. Verify and proceed if happy with the changes it will make.
8. Remove staging mode.
9. Re-enable the sync scheduler

```powershell
Set-ADSyncScheduler -SyncCycleEnabled $True
```
