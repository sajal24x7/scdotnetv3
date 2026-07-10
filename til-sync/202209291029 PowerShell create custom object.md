---
tags:
  - "#powershell"
aliases:
---
SoftObje
```powershell

#Example create hash, create ps custom object and export
# Useful for ceating outputs
$DSProperties = @{
	ClusterName = $DSClusterName
	DataStore = $DSName
	StorageTag = $DSTag
	CapacityGB = $TotalSpaceGB
	FreeSpaceGB = $FreeSpaceGB
	ProvisionedSpaceGB = $ProvisionedSpaceGB
	NumberOfVMs = $NumberOfVMs
}

$DSUtilReport = New-Object -TypeName PSCustomObject -Property $DSProperties
$DSUtilReport | 
	Select-Object ClusterName, DataStore, StorageTag, CapacityGB, FreeSpaceGB, ProvisionedSpaceGB, NumberOfVMs |
	Export-Csv -Path $DSReportPath -NoTypeInformation -NoClobber -Append -Encoding ASCII -Force
```


---
references:
[PowerShell: Creating Custom Objects - TechNet Articles - United States (English) - TechNet Wiki (microsoft.com)](https://social.technet.microsoft.com/wiki/contents/articles/7804.powershell-creating-custom-objects.aspx#:~:text=PowerShell%3A%20Creating%20Custom%20Objects%201%201.%20New-Object%20You,6.%20Using%20Class%20%28PowerShell%20v5%20or%20higher%29%20)