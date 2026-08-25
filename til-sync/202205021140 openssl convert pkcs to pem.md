---
aliases:
  - openssl convert pkcs to pem
tags:
  - "#cert"
category: til
updated: 2026-08-25T14:30:56
---
``` bash
openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer
```

---
references:
1. [How to convert PKCS #7 (.p7b) to PEM certificate format using OpenSSL (digicert.com)](https://knowledge.digicert.com/solution/SO21448.html)