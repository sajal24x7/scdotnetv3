---
aliases:
  - Azure AD Connect Upgrade from old version to new version
tags:
  - "#aadconnect"
  - "#entra"
  - "#entraconnect"
  - "#azure"
category: til
updated: 2026-08-25T14:30:56
---
# Methods
1. Automatic Upgrade
2. In-place upgrade
3. Swing migration (Complex deployment/upgrade windows OS)

# Swing Migration
Needs at least 2 servers: one active, one staging.
1. Active server responsible for production load.
2. Staging server prepared with new release. When ready this is made active.
3. Previous active server becomes staging and is upgraded.

### Steps
1. Export configuration of existing server
2. Install the new Azure AD Connect server with the imported settings (Staging Mode)
3. Verify Staging Sync
4. Set the Old Azure AD Connect server to staging mode (Optional)
5. Uninstall Old Azure AD Connect server



---
references:
1. [What is Azure AD Connect v2.0? - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/whatis-azure-ad-connect-v2)
2. [Azure AD Connect: Upgrade from a previous version - Microsoft Entra | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-upgrade-previous-version)
3. [Migrate Azure AD Connect to a New Server - Azure365Pro.com](https://www.azure365pro.com/migrate-azure-ad-connect-to-a-new-server/)