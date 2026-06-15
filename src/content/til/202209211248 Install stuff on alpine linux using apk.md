---
title: Install Stuff on Alpine Linux Using Apk
slug: install-stuff-on-alpine-linux-using-apk
created: '2022-09-21T12:48:00+03:00'
updated: '2022-09-21T12:48:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk45jmvj24'
---


# Command to install using local .apk file

apk add --no-cache --no-network --repositories-file=/dev/null --allow-untrusted /tmp/ca-certificates-20190108-r0.apk

---
references:
