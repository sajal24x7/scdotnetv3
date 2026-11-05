---
title: "Why We Need Certificates for Secure Communication"
slug: "why-we-need-certificates-for-secure-communication"
created: 2026-11-05T22:15:00+02:00
updated: 2026-11-05T22:19:42+02:00
category: til
tags: ["network", "security", "cer"]
---
[Encryption](/til/types-of-encryption) by itself is not enough. With just encryption, you would be talking to a bad server securely. Which is not what we want. Hence, in protocols like TLS, the server provides identification in the form of a certificate which has the server name and trusted CAs.