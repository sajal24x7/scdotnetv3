---
aliases:
  - msDS-UserPasswordExpiryTimeComputed does not show up directly
tags:
  - "#windows"
  - "#ad"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
# Reason

msDS-UserPasswordExpiryTimeComputed is a constructed attribute. It needs to be requested explicity.

```powershell
Get-ADUser <username> -Properties msDS-UserPasswordExpiryTimeComputed, *
```
# Explanation

`Default` properties are returned on all `ADObject` queries matching a specific type of `ADObject` (`ADUser` has its own set of default properties, `ADGroup` has it's own set, etc.)

`Extended` properties are not returned by default but are implicitly enumerable static attributes on an `ADObject`.

`Constructed` attributes are not static properties but are calculated based on the values of other attributes belonging to an `ADObject`. I could not find any info on this, but I imagine that enumerating all `Constructed` attributes can be an expensive operation since the values are computed, and as such need to be **explicitly** requested via the `-Properties` parameter of the `Get-ADObject` cmdlets.

This all seems to be related to the `systemFlags` attribute on an `ADObject`, which is where the attribute types are set. From my testing, attributes with either the `Constructed (4)` or `Non-Replicated (2)` flag need to be explicitly specified to be returned from the RSAT cmdlets.

---
# references:
[powershell - Is msDS-UserPasswordExpiryTimeComputed a "hidden" member? - Super User](https://superuser.com/questions/1738998/is-msds-userpasswordexpirytimecomputed-a-hidden-member)
