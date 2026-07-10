---
tags:
  - windows
aliases:
category: til
---

# Register with kms server
```cmd
slmgr.vbs /skms <kms server>
slmgr.vbs /ato
```

# Issues
## Activation fails with access denied error
1. In the Run prompt type DCOMCNFG and hit Enter.
2. In the left pane expand Component Services –> Computers and right-click on My Computer and then Properties.
3. In My Computer properties window select the COM Security tab and then click on Edit Default.
4. Add SELF account and select Allow for both Local and Remote access.
5. Click OK twice and restart the server. After the server restarts, Windows should be activated.

---
references:
1. [Activation Issue]((https://www.wincert.net/windows-server/cannot-activate-windows-error-code-0x80070005/)