---
aliases:
  - Certificate output in plaintext
tags:
  - "#cert"
category: til
updated: 2026-08-25T14:30:56
---
# Issue
“x509: certificate relies on legacy Common Name field” error

## Fix
 cert needs to be reissued to include the subjectAltName property, and should be added directly when creating an SSL self-signed certificate using openssl command, by specifying an -addext flag.

``` bash
-addext "subjectAltName = DNS:domain-name.com"
```

```bash
openssl x509 -in server.crt -noout -text
```


---
references:
1. [GENERAL: What should I do if I get an "x509: certificate relies on legacy Common Name field" error? (jfrog.com)](https://jfrog.com/knowledge-base/general-what-should-i-do-if-i-get-an-x509-certificate-relies-on-legacy-common-name-field-error/?msclkid=88df7800c79611ecac9b1f57c6d766d7)