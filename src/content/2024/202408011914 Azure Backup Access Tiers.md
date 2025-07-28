---
title: Azure Backup Access Tiers
slug: azure-backup-access-tiers
pubDate: '2024-08-01T19:14:00+03:00'
updatedDate: '2024-08-01T19:14:00+03:00'
category: til
tags:
- azure
- backup
---

Access tiers for [[202404071559 Azure Backup|Azure backup]]
1. Snapshot tier
	1. backups stored in customer tenant and RG
	2. Faster to restore
2. Vault-Standard tier
	1. backups stored in a MSFT tenant (so more secure)
	2. Slower to restore
3. Archive tier
	1. for long term archival 

---
# references: