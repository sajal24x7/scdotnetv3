---
title: Powershell Get Ad Group Details
slug: powershell-get-ad-group-details
created: '2024-07-16T11:52:00+03:00'
updated: '2024-07-16T11:52:00+03:00'
category: til
tags:
  - powershell
  - ad
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754958243697554'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnrznp7y2v'
---

```powershell
Get-ADGroup -Filter * -SearchBase 'OU=Finland,DC=fi,DC=tcsecp,DC=com' -Properties * | select Name, Description, @{Name='MemberCount';Expression={$_.Members.Count}} | Export-Csv -Path 'C:\Users\845874.adm.FI\Desktop\test.csv' -NoClobber -NoTypeInformation -Force
```

---
# references:
