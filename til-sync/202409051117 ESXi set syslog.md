---
aliases:
  - ESXi set syslog
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
Syslog.global.logDir --> Location where logs will be set
Syslog.global.logHost --> remote servers where logs are sent using the syslog protocol
slog.global.logDirUnique --> bool/whether unique directory will be created in logDir or not

---
# references:
[Configuring syslog on ESXi (broadcom.com)](https://knowledge.broadcom.com/external/article/318939/configuring-syslog-on-esxi.html)