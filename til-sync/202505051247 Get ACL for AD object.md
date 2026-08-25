---
aliases:
  - Get ACL for AD object
tags:
  - "#powershell"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Import-Module ActiveDirectory

# Define the distinguished name (DN) of the AD object
$objectDN = "CN=YourObjectName,OU=YourOU,DC=YourDomain,DC=com"

# Get the ACL for the AD object
$acl = Get-ACL -Path "AD:$objectDN"  

# Display the ACL
$acl.Access | Format-Table -Property IdentityReference, ActiveDirectoryRights, AccessControlType, IsInherited, InheritanceFlags, PropagationFlags
```

---
# references: