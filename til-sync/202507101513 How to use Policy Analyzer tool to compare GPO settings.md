---
aliases:
  - How to use Policy Analyzer tool to compare GPO settings
tags:
  - "#windows"
  - "#ad"
  - "#gpo"
category: til
updated: 2026-08-25T14:30:56
---
- gpresult and using Get-GPOreport does not work because it can export output in .xml or html but PolicyAnalyzer wants backup format

>Policy Analyzer can ingest four types of GPO files: registry policy files, security templates, audit policy backup files, and backup.xml files that reference Group Policy client side extensions (CSEs) required by settings in the GPO.

There are two ways to do this:
1. On the DC you can use this snippet to create backup of all GPOs that apply to a specific OU

```powershell
# Specify the OU  
$OU = ""

# Get GPO links for the OU  
$GPOs = Get-GPInheritance -Target $OU | Select-Object -ExpandProperty InheritedGpoLinks

# Loop through the GPOs and generate reports  
foreach ($GPO in $GPOs) {  
  $Name = $GPO.DisplayName
  Backup-GPO -Name $Name -Path "C:\Temp\GPOBackups\"  
}
```

2. On a member server or local server, use LGPO.exe tool

```cmd
lgpo.exe /b <foldername>
```

---
# references: