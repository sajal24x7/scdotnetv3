---
title: "How to Find Chrome Version on Windows Node"
slug: "how-to-find-chrome-version-on-windows-node"
created: 2026-05-11T14:26:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "chrome"]
---
This is one alternative. There are others, for example, checking the registry key. But that has failed on occasion in tools like Jenkins, that the key does not exist.

```powershell

(Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo

ProductVersion   FileVersion      FileName  
--------------   -----------      --------  
147.0.7727.102   147.0.7727.102   C:\Program Files\Google\Chrome\Application\chrome.exe

```