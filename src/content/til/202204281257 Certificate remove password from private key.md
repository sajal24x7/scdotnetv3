---
title: Certificate Remove Password From Private Key
slug: certificate-remove-password-from-private-key
pubDate: '2022-04-28T12:57:00+03:00'
updatedDate: '2022-04-28T12:57:00+03:00'
category: til
tags:
- cert
---


# Remove Private key
```bash
openssl rsa -in [file1.key] -out [file2.key]
```


---
references:
[Remove private key password using openSSL – Tricks and Picks (wordpress.com)](https://haythamsalhi.wordpress.com/2018/07/04/remove-private-key-password-using-openssl/?msclkid=531a8789c6d611ecbc82b9fce9010b6c)