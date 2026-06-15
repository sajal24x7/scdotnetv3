---
title: Get ACL for AD Object
slug: get-acl-for-ad-object
created: 2025-05-05T09:39:14.000Z
updated: 2025-05-05T09:39:14.000Z
category: til
tags:
  - powershell
  - ad
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododvwulh2s'
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
