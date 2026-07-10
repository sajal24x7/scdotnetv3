---
tags:
  - "#windows"
  - "#ad"
  - "#powershell"
aliases:
  - Fine-grained password policy
category: til
---
Can be done using ADAC or PowerShell. We need to set all values that need to be set, including those that might be coming from domain.
# ADAC
1. Click on Domain > System > Password Settings Container > New > Password Settings.
2. Set values as needed.
3. Under **Directly Applies To**, choose **Add**, type the name of the group to which the fine grained password policy, and then choose **OK**.
# Powershell
## Create policy

```powershell
$policyParams = @{
    Name = "PasswordPolicy"
    ComplexityEnabled = $true
    LockoutDuration = "00:30:00"
    LockoutObservationWindow = "00:30:00"
    LockoutThreshold = "0"
    MaxPasswordAge = "42.00:00:00"
    MinPasswordAge = "1.00:00:00"
    MinPasswordLength = "7"
    PasswordHistoryCount = "24"
    Precedence = "1"
    ReversibleEncryptionEnabled = $false
    ProtectedFromAccidentalDeletion = $true
}

New-ADFineGrainedPasswordPolicy @policyParams
```

## Assign policy
```
Add-ADFineGrainedPasswordPolicySubject PasswordPolicy -Subjects group1
```


---
# references:
[Create Fine Grained Password Policy (Step-by-Step-Guide) - Active Directory Pro](https://activedirectorypro.com/create-fine-grained-password-policies/)
[Configure fine grained password policies for Active Directory Domain Services in Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/fine-grained-password-policies?tabs=adac)