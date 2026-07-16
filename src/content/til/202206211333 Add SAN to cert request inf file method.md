---
title: Add SAN to Cert Request Inf File Method
slug: add-san-to-cert-request-inf-file-method
created: '2022-06-21T13:33:00+03:00'
updated: '2022-06-21T13:33:00+03:00'
category: til
tags:
  - cert
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modju3vt4q2u'
---


Template:
```ini
[NewRequest]
Subject = "CN=devname.fi.tcsecp.com"
Exportable = TRUE
KeyLength = 2048
KeySpec = 1
KeyUsage = 0xf0
RequestType = PKCS10

[Extensions]
2.5.29.17 = "{text}"
_continue_ = "dns=devname.fi.tcsecp.com"

[RequestAttributes]
CertificateTemplate = WebServer
```

For SAN, tried using the following which did not work. So, use the [Extensions] format mentioned above.
```ini
[RequestAttributes] ; If your client operating system is Windows Server 2003, Windows Server 2003 R2, or Windows XP ; and you are using a standalone CA, SANs can be included in the RequestAttributes ; section by using the following text format. SAN="dns=www01.fabrikam.com&dns=www.fabrikam.com&ipaddress=172.31.10.130"
```

---
references:
[How to Request a Certificate With a Custom SAN | Microsoft Docs](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ff625722(v=ws.10))
