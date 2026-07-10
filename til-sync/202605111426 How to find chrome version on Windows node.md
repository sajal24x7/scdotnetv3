---
tags:
  - powershell
  - chrome
aliases:
category: til
---
This is one alternative. There are others, for example, checking the registry key. But that has failed on occasion in tools like Jenkins, that the key does not exist.

```powershell

(Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo

ProductVersion   FileVersion      FileName  
--------------   -----------      --------  
147.0.7727.102   147.0.7727.102   C:\Program Files\Google\Chrome\Application\chrome.exe

```