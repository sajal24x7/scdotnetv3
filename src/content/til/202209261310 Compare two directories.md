---
title: Compare Two Directories
slug: compare-two-directories
created: '2022-09-26T13:10:00+03:00'
updated: '2022-09-26T13:10:00+03:00'
category: til
tags: []
---


```cmd
dir /s /b > flatfile.txt
```


Compare pre and post files with fc (file-compare) or powershell using
```powershell
$File1 = Get-Content file1.txt
$File2 = Get-Content file2.txt
Compare-Object $File1 $File2
```


# Powershell script
Use powershell script for comparisons.

```powershell
$Dir = "C:\Users\smigmgmt\Desktop\checks"
$Drive = ""
$PrePath = $Dir + "\$Drive" + "pre.txt"
$PostPath = $Dir + "\$Drive" + "post.txt"
$OutPutPath = $Dir + "\$Drive" + "diff.txt"
$Pre = Get-Content -Path $PrePath
$Post = Get-Content -Path $PostPath
Compare-Object -ReferenceObject $Pre -DifferenceObject $Post |
    Select-Object InputObject, SideIndicator |
    Out-File -FilePath $OutPutPath -Width 1000
```

---
references: