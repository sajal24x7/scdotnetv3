---
title: "How to Check Windows Upgrade Errors"
slug: "how-to-check-windows-upgrade-errors"
created: 2025-08-12T17:11:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["windows", "update", "upgrade"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoeqpiop2u'
  - 'https://mastodon.social/@sajal24x7/116756409026602565'
---
[Windows update log files](https://learn.microsoft.com/en-us/windows/deployment/upgrade/log-files#analyze-log-files)are present under `$Windows.~BT\Sources\Panther`. There are two files `setupact.log` and `setuperr.log`.

Additionally, during upgrade [setupdiag](https://learn.microsoft.com/en-us/windows/deployment/upgrade/setupdiag) automatically creates logs under `%windir%\logs\SetupDiag\SetupDiagResults.xml`.

Setupdiag is present under %SystemDrive%\$Windows.~bt\Sources

This above file will be useful as it has the appropriate message.

Check at what stage the error occurred, and what is the error code, which can be checked against [Win32_Error codes](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/18d8fbe8-a967-4f1c-ae50-99ca8e491d2d).

For example:

```text
0x00000070 - ERROR_DISK_FULL
```

# How to run setupdiag if not present

```cmd
SetupDiag.exe /Output:C:\Temp\Results.log
```