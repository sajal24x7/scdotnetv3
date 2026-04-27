---
title: Azure AD Sync SSO Disable RC4
slug: azure-ad-sync-sso-disable-rc4
pubDate: '2023-06-27T15:12:00+03:00'
updatedDate: '2023-06-27T15:12:00+03:00'
category: til
tags:
- azure
- entraconnect
---


## Enforcing AES256 for the Azure AD SSO Account in Active Directory
1. Go to computer OU.
2. Right click on the Azure sync account AZUREADSSOACC. Go to attribute editor.
3. Update msDS-SupportedEncryptionTypes to 16 (AES 256) and confirm OK

## Roll-Over of the Kerberos Decryption Key (to enable SSO again)
on the Azure AD Connect server:
1. Run powershell as Admin. And run the following commands:
2. cd to $env:programfiles"\Microsoft Azure Active Directory Connect" 
3.  Import-Module .\AzureADSSO.psd1
4. New-AzureADSSOAuthenticationContext 
In popup enter credentials.
5. Get-AzureADSSOStatus | ConvertFrom-Json
This command provides you the list of AD forests (look at the "Domains" list) on which this feature has been enabled.
6. $creds = Get-Credential 
Enter credentials in jty\AID format. Domain Admin credentials.
7. Update-AzureADSSOForest -OnPremCredentials $creds
This command updates the Kerberos decryption key for the AZUREADSSO computer account in this specific AD forest and updates it in Azure AD.

---
# references:
[Secure Active Directory + Azure AD SSO and disable RC4 HMAC - azuregeek.io](https://azuregeek.io/en/secure-azure-ad-sso-and-disable-rc4-hmac/)
[Roll over Kerberos decryption key for Seamless SSO computer account - Azure Cloud & AI Domain Blog (azurecloudai.blog)](https://azurecloudai.blog/2020/08/03/roll-over-kerberos-decryption-key-for-seamless-sso-computer-account/)
[Azure AD Connect - Microsoft Entra | Microsoft Learn](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/connect/how-to-connect-sso-faq)
[Decrypting the Selection of Supported Kerberos Encryption Types - Microsoft Community Hub](https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/decrypting-the-selection-of-supported-kerberos-encryption-types/ba-p/1628797)