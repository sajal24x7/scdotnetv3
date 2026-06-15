---
title: "Get ACL for AD Object"
slug: "get-acl-for-ad-object"
created: 2025-05-05T12:39:14+03:00
updated: 2025-05-05T12:39:14+03:00
category: til
tags:
  - powershell
  - ad

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