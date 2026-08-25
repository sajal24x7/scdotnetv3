---
aliases:
  - Get Azure VM Images
tags:
  - "#powershell"
  - "#azure"
  - "#compute"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

# Get Offers
Get-AzVMImageOffer -Location "East Us" -PublisherName "MicrosoftWindowsServer"

# Get SKus
Get-AzVMImageSku -Location "East Us" -PublisherName "MicrosoftWindowsServer" -Offer "windowsserver"

# Get VM Image
Get-AzVMImage -Location "East Us" -PublisherName "MicrosoftWindowsServer" -Offer "windowsserver" -Skus "2022-datacenter-azure-edition"

```

---
# references: