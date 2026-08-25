---
aliases:
  - Manually cleaning DFSR folder
tags:
  - windows
  - dfsr
category: til
updated: 2026-08-25T14:30:56
---
Quota can be checked in DFS management > Replication > Staging Quota

```cmd

# Get folder list
WMIC.EXE /namespace:\\root\microsoftdfs path dfsrreplicatedfolderconfig get replicatedfolderguid,replicatedfoldername

# Clear quota
WMIC.EXE /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo where "replicatedfolderguid='<RF GUID>'" call cleanupconflictdirectory

```

if the above does not work:
1. Stop the DFSR service.
2. Delete the contents of the ConflictAndDeleted folder manually (with explorer.exe or DEL).
3. Delete the ConflictAndDeletedManifest.xml file.
4. Start the DFSR service back up.

---
# references:
[Manually Clearing the ConflictAndDeleted Folder in DFSR | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/askds/manually-clearing-the-conflictanddeleted-folder-in-dfsr/395711)