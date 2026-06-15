---
title: ESXi Set Syslog
slug: esxi-set-syslog
created: '2024-09-05T11:17:00+03:00'
updated: '2024-09-05T11:17:00+03:00'
category: til
tags:
  - vmware
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoats6x72l'
  - 'https://mastodon.social/@sajal24x7/116756212238190217'
---

Syslog.global.logDir --> Location where logs will be set
Syslog.global.logHost --> remote servers where logs are sent using the syslog protocol
slog.global.logDirUnique --> bool/whether unique directory will be created in logDir or not

---
# references:
[Configuring syslog on ESXi (broadcom.com)](https://knowledge.broadcom.com/external/article/318939/configuring-syslog-on-esxi.html)
