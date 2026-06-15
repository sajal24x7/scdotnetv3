---
title: Powershell Search Ad for a User
slug: powershell-search-ad-for-a-user
created: '2022-10-07T19:01:00+03:00'
updated: '2022-10-07T19:01:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754719178142076'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkfclfrw2o'
  - 'https://www.threads.com/@sajal24x7/post/DZnFyr2lk_j'
---


```
$ADFilter = "*345" #anything which has 345 at end
Get-ADUser -Server $Domain -Filter { SamAccountName -like $ADFilter } -Properties *
```

---
references:
