---
tags:
aliases:
category: til
---
```powershell

[xml]$arf = Get-Content C:\Users\845874\Desktop\133522-k8sw-wni.kehi.okobank.net-20250803011443.xml


# Define the ARF namespace
$ns = New-Object System.Xml.XmlNamespaceManager($arf.NameTable)
$ns.AddNamespace("arf", "http://scap.nist.gov/schema/asset-reporting-format/1.1")

$reports = $arf.SelectNodes("//arf:report", $ns)
$reports.Count


$rules = $arf.SelectNodes("//*[local-name()='Rule'")

$rules = $arf.SelectNodes("//*[local-name()='Rule']")

$rows = @()

foreach ($rule in $rules) {
    $rows += [pscustomobject]@{
        Title = $rule.Title
        ID = $rule.id
        CISRef = $rule.reference | Where-Object { $_.href -match "cisecurity.org/benchmark/"} | Select-Object -ExpandProperty '#text' -First 1
    }
}

$rows | Export-Csv -Path C:\Users\845874\Desktop\rules3.csv -NoTypeInformation -Encoding UTF8
```