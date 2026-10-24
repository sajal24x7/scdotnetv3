---
title: "Dcpromo Fails With Access Denied Error"
slug: "dcpromo-fails-with-access-denied-error"
created: 2025-04-16T20:26:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["windows", "ad"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododnjvby2v'
  - 'https://mastodon.social/@sajal24x7/116756406340972193'
---
This can happen during demotion.

1. Check that the computer object - prevent object from accidental deletion is not ticked on.
2. The second thing is to check the GPO > Default domain policy > Windows settings > Security Settings > Local Policies > User Right Assignment > Enable computer and user accounts to be trusted for delegation. Add the Administrator in it . Then run `gpupdate`.

---
# references:
