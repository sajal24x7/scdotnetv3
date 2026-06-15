---
title: Manually Cleaning DFSR Folder
slug: manually-cleaning-dfsr-folder
created: '2024-12-02T11:41:00+03:00'
updated: '2024-12-02T11:41:00+03:00'
category: til
tags:
  - windows
  - dfsr
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoca7my72z'
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
