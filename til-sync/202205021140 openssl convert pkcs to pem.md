---
tags:
  - cert
aliases:
category: til
---
``` bash
openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer
```

---
references:
1. [How to convert PKCS #7 (.p7b) to PEM certificate format using OpenSSL (digicert.com)](https://knowledge.digicert.com/solution/SO21448.html)