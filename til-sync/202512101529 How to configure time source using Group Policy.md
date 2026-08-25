---
aliases:
  - How to configure time source using Group Policy
tags:
  - "#time"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
Can be useful for non-domain joined machines.

1. Go to **Computer Configuration\Administrative Templates\System\Windows Time Service**.
2. Enable NTP Client.
3. Configure Windows NTP Client
    - Double-click **Configure Windows NTP Client**.
    - Set it to **Enabled**.
    - Configure:
        - **NTP Server**: Enter your NTP server(s), e.g.:
            ```
            0.pool.ntp.org,0x1
            ```
            (The `,0x1` flag means "special poll" mode.)
        - **Type**: Set to `NTP`.
        - **CrossSiteSyncFlags**: Leave default.
        - **ResolvePeerBackoffMinutes**: Default is fine.
        - **SpecialPollInterval**: Common value is `3600` (seconds = 1 hour).
        - **EventLogFlags**: Default is fine.
4. Apply and Close
5. Run `gpupdate /force`