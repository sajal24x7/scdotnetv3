---
title: Openssl Convert Pkcs to Pem
slug: openssl-convert-pkcs-to-pem
pubDate: '2022-05-02T11:40:00+03:00'
updatedDate: '2022-05-02T11:40:00+03:00'
category: til
tags:
- cert
---

``` bash
openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer
```

---
references:
1. [How to convert PKCS #7 (.p7b) to PEM certificate format using OpenSSL (digicert.com)](https://knowledge.digicert.com/solution/SO21448.html)