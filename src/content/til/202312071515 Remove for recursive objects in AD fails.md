---
title: Remove for Recursive Objects in AD Fails
slug: remove-for-recursive-objects-in-ad-fails
created: '2023-12-07T15:15:00+03:00'
updated: '2023-12-07T15:15:00+03:00'
category: til
tags:
  - ad
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754756582243065'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkwcshza2o'
---

Issue is because of additional child-objects for an object : user or computer

For user it can be devices etc.
Object class: msExchActiveSyncDevices, for example

```powershell
## Remove fails with - The directory service can perform the requested operation only on a leaf object

## Below to get the list of all objects
Get-ADObject -SearchBase $DN -Filter *

## Remove-ADObject with -recusrsive to delete
Get-ADObject -SearchBase $DN -Filter * | Remove-ADObject -Recursive -ErrorAction Stop

```

---
# references:
