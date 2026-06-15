---
title: Powershell Set Atrributes for AD Groups
slug: powershell-set-atrributes-for-ad-groups
created: 2025-07-22T10:38:02.000Z
updated: 2025-07-22T10:38:02.000Z
category: til
tags:
  - ad
  - groups
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoeeyvex2u'
---
Use the `-Instance` property with `set-aduser` 

>The _Instance_ parameter provides a way to update a group object by applying the changes made to a copy of the object. When you set the _Instance_ parameter to a copy of an Active Directory group object that has been modified, the **Set-ADGroup** cmdlet makes the same changes to the original group object. To get a copy of the object to modify, use the **Get-ADGroup** cmdlet. The _Identity_ parameter is not allowed when you use the _Instance_ parameter. For more information about the _Instance_ parameter, see the _Instance_ parameter description.

The issue occurs when trying to use -replace with a null value. It fails. In those cases just set the values to an AD object and use the `-instance` parameter.

---
# references:
