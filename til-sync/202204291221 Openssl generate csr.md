---
aliases:
  - Openssl generate csr
tags:
  - "#cert"
category: til
updated: 2026-08-25T14:30:56
---
# Command 
```bash
openssl req -out fitcsecp.csr -new -newkey rsa:2048 -nodes -keyout fitcsecp_private_key.key -addext "subjectAltName = DNS:domain-name.com"
```

# Fill out details

``` text
Country Name (2 letter code) [XX]:
State or Province Name (full name) []:
Locality Name (eg, city) [Default City]:
Organization Name (eg, company) [Default Company Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (eg, your name or your server's hostname) []:
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```


---
references:
1. [How to create Certificate Signing Request with OpenSSL (ibm.com)](https://www.ibm.com/support/pages/how-create-certificate-signing-request-openssl?msclkid=9f588ce2c79e11ec800c3933be9dff51)