---
aliases:
  - Authentication and Authorization
tags:
  - "#azure"
  - "#entra"
category: til
updated: 2026-08-25T14:30:56
---
- Authentication (AuthN) is who you are
	- I know
	- I have (device)
	- I am
	- [[202404011532 Entra MFA|Entra MFA]]
- Authorization (AuthZ) is what you can do

AuthZ is always against [[202404011327 Entra ID|"Entra ID"]].

# Ways for authentication
There are different ways for authentication, as listed below. After authentication is done then in all cases [[202404011327 Entra ID|"Entra ID"]] creates a token.
## Password hash synchronization (cloud)
1. Best option/always recommended even if using others as primary (see pt. 4)
2. AD has password hash. 
3. Hash of this password hash is synced to [[202404011327 Entra ID|"Entra ID"]] which is then used for AuthN
4. can compare if any creds are leaked on dark web
5. can't do things like locked accounts/logon hours/expired password
## Pass through AuthN (hybrid)
- If you want to use your onprem DCs for authentication
- Sending cred to [[202404011327 Entra ID|"Entra ID"]], but it checks with onprem
## Federation (hybrid)
- Not recommended
- Could be ADFS or third-party thing
- Different flow: 
	1. Cred to federation service
	2. Federation service will check with DC
	3. Create token and share with user
	4. User will use that token to get token from [[202404011327 Entra ID|"Entra ID"]]



---
# references: