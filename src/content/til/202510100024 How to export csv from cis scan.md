---
title: How to Export Csv From Cis Scan
slug: how-to-export-csv-from-cis-scan
created: 2025-12-18T10:31:55.000Z
updated: 2025-12-18T10:31:55.000Z
category: til
tags:
  - cis
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115740129211292422'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3maay77je4r2a'
  - 'https://www.threads.com/@sajal24x7/post/DSZtVn9Dl4r'
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
