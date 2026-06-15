---
title: Windows Local Time Change
slug: windows-local-time-change
created: '2022-09-26T13:27:00+03:00'
updated: '2022-09-26T13:27:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754717277295874'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkegznxi2u'
  - 'https://www.threads.com/@sajal24x7/post/DZnFvJylgNL'
---


```cmd
w32tm /query /source
w32tm /config /syncfromflags:domhier /update
net stop w32time && net start w32time
```

---
references:
