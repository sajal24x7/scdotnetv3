---
aliases:
  - Compare private key and ssl
tags:
  - "#cert"
category: til
updated: 2026-08-25T14:30:56
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