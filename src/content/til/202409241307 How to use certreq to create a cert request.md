---
title: "How to Use Certreq to Create a Cert Request"
slug: "how-to-use-certreq-to-create-a-cert-request"
created: 2024-09-24T13:07:00+03:00
updated: 2026-10-01T17:08:54+03:00
category: til
tags: ["cert", "windows"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoba3dqv23'
  - 'https://mastodon.social/@sajal24x7/116756401716568967'
---
# Sample inf file

```text
[Version] 
Signature="$Windows NT$"

[NewRequest]
Subject = "CN=devname.sisu.example"
Exportable = TRUE
KeyLength = 2048
KeySpec = 1
KeyUsage = 0xf0
RequestType = PKCS10

[Extensions]
2.5.29.17 = "{text}"
_continue_ = "dns=devname.sisu.example"

[RequestAttributes]
CertificateTemplate = WebServer
```

# Commands to submit request
```powershell

certreq -new request.inf certnew.req

certreq -submit -config "_<ServerName\CAName>_" "_<CertificateRequest.req>_" "_<CertificateResponse.cer>_"

certreq.exe -accept $CertPath
```

# Commands to export private key

```powershell

## Export private key
## Provide password for secure cert below before running
$SecurePass = <pfx-password> | ConvertTo-SecureString -AsPlainText -Force
$CertToExport = Get-ChildItem -Path cert:\LocalMachine\My | Where-Object { $_.Subject -like "*$Device*" }
Export-PfxCertificate -Password $SecurePass -FilePath $CertPrivateKeyPath -Cert $CertToExport

```

---
# references:
[How to Request a Certificate With a Custom SAN | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/ff625722(v=ws.10))
[Add SAN to secure Lightweight Directory Access Protocol (LDAP) certificate - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-gb/troubleshoot/windows-server/certificates-and-public-key-infrastructure-pki/add-san-to-secure-ldap-certificate)