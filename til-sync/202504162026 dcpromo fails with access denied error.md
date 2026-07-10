---
tags:
  - windows
  - ad
aliases:
  - dcpromo fails with access denied error
category: til
---
This can happen during demotion.

1. Check that the computer object - prevent object from accidental deletion is not ticked on.
2. The second thing is to check the GPO > Default domain policy > Windows settings > Security Settings > Local Policies > User Right Assignment > Enable computer and user accounts to be trusted for delegation. Add the Administrator in it . Then run `gpupdate`.

---
# references:
