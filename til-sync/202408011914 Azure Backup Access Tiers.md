---
aliases:
  - Azure Backup Access Tiers
tags:
  - "#azure"
  - "#backup"
category: til
updated: 2026-08-25T14:30:56
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