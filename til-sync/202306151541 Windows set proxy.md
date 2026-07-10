---
tag: #windows
aliases:
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