---
title: Windows What Are Current Control Sets
slug: windows-what-are-current-control-sets
created: '2023-06-29T14:48:00+03:00'
updated: '2023-06-29T14:48:00+03:00'
category: til
tags: []
---


`CurrentControlSet` is an alternating symbolic link to either `ControlSet001` or `ControlSet002`. The other key is kept as a backup for the Load Last Known Good Configuration boot option.

current ControlSet number is set by Current under HKLM\System\Select.

---
# references:
[windows - How does CurrentControlSet differ from ControlSet001 and ControlSet002? - Stack Overflow](https://stackoverflow.com/questions/291519/how-does-currentcontrolset-differ-from-controlset001-and-controlset002)