---
title: "Remove Vmware Tools"
slug: "remove-vmware-tools"
created: 2022-09-26T12:47:00+03:00
updated: 2026-10-01T16:56:21+03:00
category: til
tags: ["vmware", "windows"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkal224l2v'
---
Remove from all three locations:

1.  HKLM \Software\Microsoft\Windows\CurrentVersion\uninstall
2.  HKLM\Software\Classes\Installer\Products
3.  HKEY_CLASSES_ROOT\Installer\Products

---
references:
[https://www.vladan.fr/how-to-remove-vmware-tools-manually-if-uninstall-or-upgrade-finish-with-error/](https://www.vladan.fr/how-to-remove-vmware-tools-manually-if-uninstall-or-upgrade-finish-with-error/)