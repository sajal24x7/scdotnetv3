---
title: Openssl Convert Pkcs to Pem
slug: openssl-convert-pkcs-to-pem
created: '2022-05-02T11:40:00+03:00'
updated: '2022-05-02T11:40:00+03:00'
category: til
tags:
  - cert
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhoeh7ga23'
---

``` bash
openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer
```

---
references:
1. [How to convert PKCS #7 (.p7b) to PEM certificate format using OpenSSL (digicert.com)](https://knowledge.digicert.com/solution/SO21448.html)
