---
title: "Active Directory"
slug: "active-directory"
created: 2024-10-05T14:48:00+03:00
updated: 2026-09-20T14:22:08+03:00
category: til
tags: ["ad"]
---
Active Directory provides a centralised identity store. It is a [DB](/til/active-directory-database) (ntds.dit) plus some services running on it.

It uses X.500 for the structure (the how) of the data. This is defined in the schema. We get [Organizational Units](/organizational-unit) as a result of this. An [AD Objects](/common-features-of-ad-objects) stays in these OUs. 