---
aliases:
  - SSPR
  - Entra SSPR
tags:
  - "#azure"
  - "#entra"
category: til
updated: 2026-08-25T14:30:56
---
- If user is logged in, they can reset their passwords
- If user is not logged in, or they forgot their password, with [[202405021835 Entra Self Service Password Reset|SSPR]] they can reset their passwords.

# How it works
- Portal checks users location and renders [[202405021835 Entra Self Service Password Reset|SSPR]] in appropriate language
- User enters username and captcha --> to ensure its not a bot
- User answers security questions | Authentication step
- Password reset
- Notification

## Authentication options
1. Mobile app auth
2. Mobile app code 
3. Email a code
4. Mobile phone --> SMS or call
5. Office phone
6. Security questions

In free and trial Microsoft Entra organizations, phone call options aren't supported.

- We can specify how many auth methods:  1 or 2
	- Recommended 2: Mobile app primary, also email or office phone
- Mobile phone not recommended as SMS can be spoofed
- Security questions least recommended
- For admins: 
	- Always 2 methods
	- security questions disabled

# License
P1/P2 or Microsoft 365 Apps for business or Microsoft 365.
For hybrid deployments, password write-back option to be enabled P1/P2 license or Microsoft 365 Apps for business.

---
# references: