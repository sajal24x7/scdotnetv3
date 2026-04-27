---
title: How to Configure Time Source Using Group Policy
slug: how-to-configure-time-source-using-group-policy
pubDate: 2025-12-18T10:30:51.000Z
updatedDate: 2025-12-18T10:30:51.000Z
category: til
tags:
  - time
  - windows
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115740130066457785'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3maay7lx7nh2d'
  - 'https://www.threads.com/@sajal24x7/post/DScx5Atkb9U'
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
