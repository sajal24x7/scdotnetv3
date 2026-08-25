---
aliases:
  - Azure Resource Graph
  - ARG
tags:
  - "#azure"
category: til
updated: 2026-08-25T14:30:56
---
- Querying [[202404061212 Azure Resources|ARM]] can be slow and expensive. There is a quota. So we use [[202406151133 Azure Resource Graph|Azure Resource Graph]]
	- 12000 per hour
- Provides a Read only database
	- periodically does a full scan and overwrites as needed
	- also gets notified in case of changes. allows for change tracking.
	- is up-to-date
- Use KQL to find info from [[202406151133 Azure Resource Graph|Azure Resource Graph]]
- Also has quota but it resets very fast
	- 15, resets every 5 seconds


---
# references: