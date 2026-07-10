---
tag: []
aliases:
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