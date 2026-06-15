---
title: Compare Private Key and Ssl
slug: compare-private-key-and-ssl
created: '2022-04-28T12:55:00+03:00'
updated: '2022-04-28T12:55:00+03:00'
category: til
tags:
  - cert
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnvpjnn2u'
---


```bash
openssl x509 -noout -modulus -in cert.crt | openssl md5  
openssl rsa -noout -modulus -in privkey.txt | openssl md5
```

where:  
cert.crt is your certificate  
privkey.txt is your private key.


---
references:
1. [How to verify if a Private Key Matches a Certificate? (ibm.com)](https://www.ibm.com/support/pages/how-verify-if-private-key-matches-certificate?msclkid=56b4d493c6d411ecbe736b12e8e5e572)
