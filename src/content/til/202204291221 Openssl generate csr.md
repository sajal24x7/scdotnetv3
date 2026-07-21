---
title: Openssl Generate Csr
slug: openssl-generate-csr
created: '2022-04-29T12:21:00+03:00'
updated: '2022-04-29T12:21:00+03:00'
category: til
tags:
  - cert
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhocafs324'
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

```learn
description: Generate a certificate signing request and a fresh private key in one openssl command, including a SAN.
syntax: 'openssl req -new -newkey rsa:2048 -nodes -keyout <key> -out <csr>'
prompts:
  - q: OpenSSL one-liner for a new CSR with a fresh 2048-bit key, no passphrase, and a SAN?
    a: 'openssl req -out site.csr -new -newkey rsa:2048 -nodes -keyout site.key -addext "subjectAltName = DNS:domain-name.com"'
  - q: In openssl req, what do -nodes and -addext do?
    a: '-nodes leaves the private key unencrypted; -addext adds an extension such as a subjectAltName to the request.'
```
