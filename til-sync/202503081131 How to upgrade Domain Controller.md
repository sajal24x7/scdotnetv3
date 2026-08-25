---
tags:
  - windows
  - ad
aliases:
  - How to upgrade Domain Controller
category: til
updated: 2026-08-25T14:30:56
---
In-place upgrade is not suggested. The approach to take is deploy a new server, dcpromo the old one out, rename, give the same IP, dcpromo the new one in.

# Steps
## Pre-reqs
| Steps                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ |
| Copy or take screenshots of the DNS server settings on old DC server                                                     |
| Copy or take screenshots of the TCP/IP server settings on old DC server                                                  |
| Check domains and trusts module to see if there are any trusts relationships. There should not be any but just validate. |
| Export tasks in Task Scheduler from old DC server                                                                        |
| Import tasks into Task Scheulder in the new DC server                                                                    |
| Run command netdom query fsmo and ensure that old DC is not running any FSMO roles - [[202412051521 Moving fsmo roles]]  |
| If old DC is running FSMO roles than transfer them to other existing DC server                                           |

## Activity

| Steps                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| On day of change run Dcpromo and demote old DC server                                                                               |
| Once demotion is completed perform AD validations on old other DC server i.e. dcdiag and repadmin/replsummary                       |
| Check and verify that nslookup for the domain shows only old KEHIDC1 IP addresses                                                   |
| Check and see if old KEHIDC3 computer account is still Domain Controller OU or has moved to Computers OU                            |
| On old KEHIDC1 you use NTDS util to check and see if KEHIDC1 is still the only DC listed                                            |
| Once steps 10,11,12 are successful you can shutdown the old KEHIDC3 server                                                          |
| Ensure the TCP/IP server settings on the new Server match that of the old server as per the screenshots taken                       |
| Reset the KEHIDC3 computer account in AD and change the name and IP address of the new server to KEHIDC3 and the old IP             |
| Run Dcpromo on the new server and promote it to install all the Active Directory Roles.                                             |
| Install the AD directories onto the D drive of the server.                                                                          |
| Once server installs all the roles and restarts, perform AD validations on both KEHIDC servers i.e. dcdiag and repadmin/replsummary |
| Check and verify that nslookup for kehi.okobank.net shows both KEHIDC IP addresses                                                  |
| Check and see if KEHIDC3 computer account is now in Domain Controller OU                                                            |
| On old KEHIDC1 you use NTDS util to check and see if both KEHIDC's show are listed                                                  |
| Ensure the DNS server settings match that of the old server as per the screenshots taken                                            |
| Once steps 18,19,20 are successful ensure all the required agents and their services are running                                    |
| Drop mail to Solarwinds, Backup, AzureCCC team to ensure that their agents on this new DC are working properly.                     |
| Once all above steps are done ensure the imported tasks are running in task scheduler, than server can be handed over to Kauko      |

# Commands

```powershell


```

---
# references: