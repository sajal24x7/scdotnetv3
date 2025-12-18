---
title: "How to export csv from cis scan"
slug: "how-to-export-csv-from-cis-scan"
pubDate: 2025-12-18T12:31:55+02:00
updatedDate: 2025-12-18T12:31:55+02:00
category: til
tags:
  - cis
  - powershell

---
```powershell

[xml]$arf = Get-Content 0250803011443.xml


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

$rows | Export-Csv -Path rules3.csv -NoTypeInformation -Encoding UTF8
```