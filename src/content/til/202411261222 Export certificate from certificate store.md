---
title: "Export Certificate From Certificate Store"
slug: "export-certificate-from-certificate-store"
created: 2024-11-26T12:22:00+02:00
updated: 2026-10-01T17:10:10+03:00
category: til
tags: ["cert", "powershell"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modobz5fp72s'
  - 'https://www.threads.com/@sajal24x7/post/DZnNxeSlpZA'
  - 'https://mastodon.social/@sajal24x7/116756403297199713'
---
`Export-Certificate` command can be used to export certificate in .cer or .p10.

`Export-PfxCertificate` to export private key

```powershell

$CertToExport = Get-ChildItem -Path cert:\LocalMachine\My | Where-Object { $_.Subject -like "*$Device*" }
Export-Certificate -Cert $CertToExport -FilePath $CertPath -Type CERT


$SecurePass = <pfx-password> | ConvertTo-SecureString -AsPlainText -Force
    $CertToExport = Get-ChildItem -Path cert:\LocalMachine\My | Where-Object { $_.Subject -like "*$Device*" }
    Export-PfxCertificate -Password $SecurePass -FilePath $CertPrivateKeyPath -Cert $CertToExport

```

---
# references: