---
title: Create Powershell Offline Repo
slug: create-powershell-offline-repo
created: '2024-08-12T16:10:00+03:00'
updated: '2024-08-12T16:10:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modo53zbea2m'
  - 'https://mastodon.social/@sajal24x7/116756208688377557'
---

Fastest way to install modules on disconnected servers is [[202210111009 Powershell install modules offline|Install powershell modules]].

A better way is to create an offline repo and use it to install the modules.

There are two types of offline repos:
1. nuget based
2. fileshare based

This will details steps for file share based offline repo.

# Install powershellget

1. Save OfflinePowerShellGetDeploy

```powershell
# Save OfflinePowerShellGetDeploy to system which has internet access

Save-Module -Name OfflinePowerShellGetDeploy -Path C:\Users\845874\Downloads\PowerShellGet
Import-Module C:\Users\845874\Downloads\PowerShellGet\OfflinePowerShellGetDeploy


Save-PowerShellGetForOffline -LocalFolder 'C:\Users\845874\Downloads\PowerShellGet\OfflinePowerShellGet'
```

2. Copy this folder to the disconnected system.
3. Install OfflinePowerShellGetDeploy

```
Import-Module .\OfflinePowerShellGetDeploy

```

```powershell
# Register a file share on my local machine 

$registerPSRepositorySplat = @{ 
	Name = 'LocalPSRepo' 
	SourceLocation = '\\localhost\PSRepoLocal\' 
	ScriptSourceLocation = '\\localhost\PSRepoLocal\' 
	InstallationPolicy = 'Trusted' 
}

Register-PSRepository @registerPSRepositorySplat

```

---
# references:
[Working with local PSRepositories - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/gallery/how-to/working-with-local-psrepositories?view=powershellget-3.x)
