---
title: PowerShell Set Custom Properties for AD Users
slug: powershell-set-custom-properties-for-ad-users
pubDate: '2022-06-08T10:56:00+03:00'
updatedDate: '2022-06-08T10:56:00+03:00'
category: til
tags:
- powershell
---


Set-ADUser can be used to modify AD users.
We can edit values of other user attributes (including extensionAttribute and custom attributes) in AD using these Set-ADUser options:

-   Add – adds an attribute value
-   Replace – replaces an attribute value
-   Clear – clears an attribute value
-   Remove — removes one of the attribute values

# Add a custom attribute
```powershell
Set-ADUser C.Bob -Add @{extensionAttribute5 = "Test1"}

# Replace
Set-ADUser
```

# Update AD SamAccountName
```powershell
$NewSAMAccountName = $User.SamAccountName.ToUpper()  
$User | Set-ADUser -Server $Domain -Replace @{samaccountname=$NewSAMAccountName}
```

## Update msds-AllowedToDelegateTo

```powershell

## Add something
$User | Set-ADUser -Add @{'msDS-AllowedToDelegateTo'='MSSQLSvc/JTYSQL19C1VS2.jty.okobank.net:1433'}


## Remove something
*## THis removes that particular value only.
$User | Set-ADUser -Remove @{'msDS-AllowedToDelegateTo'='MSSQLSvc/jtysql10vs4.jty.okobank.net:1663'}*

```


## Service principalnames

```powershell
Set-ADComputer -ServicePrincipalNames @{Add='WSMAN/Mycomputer','WSMAN/Mycomputer.MyDomain.Com'}
```

# Add multiple properties in one go
```powershell

$Properties = @{
	extensionAttribute2 = $UserData.extensionAttribute2
	extensionAttribute5 = 'S;'
	extensionAttribute7 = $UserData.extensionAttribute7
	extensionAttribute11 = '592106'
}
$ADUser | Set-ADUser -Add $Properties -ErrorAction Stop
```

---
references:
[Set-ADUser Modify Active Directory Users with PowerShell (bobcares.com)](https://bobcares.com/blog/set-aduser-modify-active-directory-users-with-powershell/)