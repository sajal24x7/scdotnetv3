---
title: Dcpromo Fails With Access Denied Error
slug: dcpromo-fails-with-access-denied-error
created: 2025-04-16T17:39:48.000Z
updated: 2025-04-16T17:39:48.000Z
category: til
tags:
  - windows
  - ad
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododnjvby2v'
---
This can happen during demotion.

1. Check that the computer object - prevent object from accidental deletion is not ticked on.
2. The second thing is to check the GPO > Default domain policy > Windows settings > Security Settings > Local Policies > User Right Assignment > Enable computer and user accounts to be trusted for delegation. Add the Administrator in it . Then run `gpupdate`.

---
# references:
