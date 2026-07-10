---
tags:
  - "#ansible"
aliases:
---

Types:
1. Private credential (any user can create it/owner and sys admins can use it/sys auditors can see it)
2. Organization credential (sys admin and admins can create it/can be assigned to users and teams)

>The automation controller `Admin` user can assign an organization to an existing private credential, converting a private credential into an organization credential.

Once credential is created/saved, no way to get the password in plain text. It is encrypted and then saved in DB.

Credentials can be configured to prompt for password.

---
# references: