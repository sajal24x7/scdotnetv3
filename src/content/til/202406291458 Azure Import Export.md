---
title: Azure Import Export
slug: azure-import-export
created: '2024-06-29T14:58:00+03:00'
updated: '2024-06-29T14:58:00+03:00'
category: til
tags:
  - azure
  - storage
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754948186585020'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnngx4kn2z'
---

- To import/export large amount of data to and from Azure using physically shipping drives etc
	- Recommendation to use Azure Data Box to import to Azure
- WAImportExport tool prepares drive to write data to
	- formats, checks for errors, encrypts disk
	- creates journal file
	- V1 - for blob
	- V2 - for [[202406291221 Azure Files|Azure Files]]
	- 

---
# references:
[MS Learn](https://learn.microsoft.com/en-us/training/modules/export-data-with-azure-import-export/2-what-is-azure-import-export)
https://learn.microsoft.com/en-us/azure/import-export/storage-import-export-service
[Import data to Azure Files](https://learn.microsoft.com/en-us/azure/import-export/storage-import-export-data-to-files?tabs=azure-portal-preview)
>Modify the _dataset.csv_ file in the root folder where the tool is. Depending on whether you want to import a file or folder or both, add entries in the _dataset.csv_ file
>Modify the _driveset.csv_ file in the root folder where the tool is. Add entries in the _driveset.csv_ file similar to the following examples. The driveset file has the list of disks and corresponding drive letters so that the tool can correctly pick the list of disks to be prepared.
