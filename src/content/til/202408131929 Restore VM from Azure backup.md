---
title: Restore VM From Azure Backup
slug: restore-vm-from-azure-backup
created: '2024-08-13T19:29:00+03:00'
updated: '2024-08-13T19:29:00+03:00'
category: til
tags:
- azure
- backup
---

Part of [[202408131927 Azure restore from backup|Restore from backups]]
# Restore Options

1. Create a new VM
2. Restore disk
	1. A template is generated where we can specify VM settings.
		1. Disks are copied to the RG we specify
	2. Or, attach the disk to existing VM, or create a new VM using powershell and attach the disk to it.
3. Replace existing disk on existing VM
	1. After replace original disk is retained and can be deleted manually

---
# references:
[Restore VM](https://learn.microsoft.com/en-us/azure/backup/backup-azure-arm-restore-vms)