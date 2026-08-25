---
aliases:
  - Migrating between redundancy types in Azure Storage
tags:
  - "#azure"
  - "#storage"
category: til
updated: 2026-08-25T14:30:56
---
Related to [[202404091908 Azure Storage Redundancy]]

| Switching From | ...to LRS                                                              | ...to GRS/RA-GRS                                                       | ...to ZRS                                                                                         | ...to GZRS/RA-GZRS                                                                                       |
| -------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| LRS            | N/A                                                                    | Use Azure portal, PowerShell, or CLI to change the replication setting | Perform a manual migration<br><br>OR<br><br>Request a live migration                              | Perform a manual migration<br><br>OR<br><br>Switch to GRS/RA-GRS first and then request a live migration |
| GRS/RA-GRS     | Use Azure portal, PowerShell, or CLI to change the replication setting | N/A                                                                    | Perform a manual migration<br><br>OR<br><br>Switch to LRS first and then request a live migration | Perform a manual migration<br><br>OR<br><br>Request a live migration                                     |
| ZRS            | Perform a manual migration                                             | Perform a manual migration                                             | N/A                                                                                               | Use Azure portal, Power Shell, or CLI to change the replication setting                                  |
| GZRS/RA-GZRS   | Perform a manual migration                                             | Perform a manual migration                                             | Use Azure portal, Power Shell, or CLI to change the replication setting                           | N/A                                                                                                      |


---
# references: