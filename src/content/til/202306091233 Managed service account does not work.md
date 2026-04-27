---
title: Managed Service Account Does Not Work
slug: managed-service-account-does-not-work
pubDate: '2023-06-09T12:33:00+03:00'
updatedDate: '2023-06-09T12:33:00+03:00'
category: til
tags: []
---


```text
Error:
Install-ADServiceAccount : Cannot Install service account. Error Message:  ‘The provided context did not match the target’

The Test-ADServiceAccount cmdlet gives us a little more to go on:

WARNING: Test failed for Managed Service Account SQLServerGMSA. If standalone Managed Service Account, the account is linked to another computer object in the Active Directory. If group Managed Service Account, either this computer does not have permission to use the group MSA or this computer does not support all the Kerberos encryption types required for the gMSA. See the MSA operational log for more information.

```

## Cause
Windows server is configured not to use RC4. AES should be configured explicitly for service accounts.

```powershell
Set-ADServiceAccount -Identity <account name> -KerberosEncryptionType AES128,AES256
```

---
# references:
[Cannot install service account. The provided context did not match the target (rssing.com)](https://technet239.rssing.com/chan-4753999/article26556.html)
[Group Managed Service Accounts Overview | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831782(v=ws.11)?redirectedfrom=MSDN)