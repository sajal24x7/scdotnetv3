---
title: Install stuff on alpine linux using apk
slug: install-stuff-on-alpine-linux-using-apk
pubDate: '2022-09-21T12:48:00+03:00'
updatedDate: '2022-09-21T12:48:00+03:00'
category: til
tags: []
---


# Command to install using local .apk file

apk add --no-cache --no-network --repositories-file=/dev/null --allow-untrusted /tmp/ca-certificates-20190108-r0.apk

---
references: