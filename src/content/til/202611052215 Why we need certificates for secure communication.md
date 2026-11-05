---
title: Why We Need Certificates for Secure Communication
slug: why-we-need-certificates-for-secure-communication
created: 2026-11-05T20:15:00.000Z
updated: 2026-11-05T20:19:42.000Z
category: til
tags:
  - network
  - security
  - cer
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117566462523280902'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mzlzxh2k3b2m'
  - 'https://www.threads.com/@sajal24x7/post/DfYOojEFKjq'
---
[Encryption](/til/types-of-encryption) by itself is not enough. With just encryption, you would be talking to a bad server securely. Which is not what we want. Hence, in protocols like TLS, the server provides identification in the form of a certificate which has the server name and trusted CAs.
