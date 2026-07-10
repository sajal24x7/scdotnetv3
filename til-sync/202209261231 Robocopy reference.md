---
tag: #windows, #robocopy
aliases:
---

# robocopy-command

```cmd
net use "" /user:<domainid>
robocopy "" "" /E /COPYALL /R:0 /W:0 /FP /ZB /LOG+:C:\Robologs\F.txt /TEE /MT:128

# Create folder structure only.  
robocopy "source" "target" /e /xf *

```


```powershell
# Copy 
Get-ChildItem -Path $Path -Recurse -File | Copy-Item -Destination "\\opflttru16-52.op.okobank.com\RMK\Burana\Ad-hoc_History_Load\LOAD" -Exclude 'buranaout_*'

```

---
references:
[Robocopy and a Few Examples - TechNet Articles - United States (English) - TechNet Wiki (microsoft.com)](https://social.technet.microsoft.com/wiki/contents/articles/1073.robocopy-and-a-few-examples.aspx)
[itprolink](https://social.technet.microsoft.com/Forums/security/en-US/0b3d3006-0e0f-4c95-9e2f-4c820832ebfa/using-robocopy-to-copy-folder-structure-only?forum=w7itprogeneral)
[online link](https://cects.com/copying-directory-structures-without-files/)
