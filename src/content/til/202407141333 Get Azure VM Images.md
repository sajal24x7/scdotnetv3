---
title: Get Azure VM Images
slug: get-azure-vm-images
created: '2024-07-14T13:33:00+03:00'
updated: '2024-07-14T13:33:00+03:00'
category: til
tags:
  - powershell
  - azure
  - compute
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754953423164419'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnptj6yy2v'
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
