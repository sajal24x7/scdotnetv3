---
title: Windows Set Proxy
slug: windows-set-proxy
created: '2023-06-15T15:41:00+03:00'
updated: '2023-06-15T15:41:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754745189197339'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkr552i22s'
---



```cmd
set proxy myproxy
set proxy myproxy:80 "<local>bar"
netsh winhttp set proxy proxy-server="http=myproxy;https=sproxy:88" bypass-list="*.contoso.com"

# Remove proxy
netsh winhttp reset proxy
```


---
# references:
[Netsh Commands for Windows Hypertext Transfer Protocol (WINHTTP) | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc731131(v=ws.10)?redirectedfrom=MSDN#BKMK_5)
