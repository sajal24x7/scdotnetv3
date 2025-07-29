---
title: "Get ACL for AD object"
slug: "get-acl-for-ad-object"
pubDate: 2025-07-29T21:39:14+03:00
updatedDate: 2025-07-29T21:39:14+03:00
category: TIL
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