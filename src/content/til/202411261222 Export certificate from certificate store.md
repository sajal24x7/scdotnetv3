---
title: Export Certificate From Certificate Store
slug: export-certificate-from-certificate-store
pubDate: '2024-11-26T12:22:00+03:00'
updatedDate: '2024-11-26T12:22:00+03:00'
category: til
tags: []
---

Export-Certificate command can be used to export certificate in .cer or .p10.
Export-PfxCertificate to export private key

```powershell

$CertToExport = Get-ChildItem -Path cert:\LocalMachine\My | Where-Object { $_.Subject -like "*$Device*" }
Export-Certificate -Cert $CertToExport -FilePath $CertPath -Type CERT


$SecurePass = '123456' | ConvertTo-SecureString -AsPlainText -Force
    $CertToExport = Get-ChildItem -Path cert:\LocalMachine\My | Where-Object { $_.Subject -like "*$Device*" }
    Export-PfxCertificate -Password $SecurePass -FilePath $CertPrivateKeyPath -Cert $CertToExport

```

---
# references: