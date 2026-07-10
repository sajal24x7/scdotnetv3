---
tags:
  - "#ansible"
aliases:
---

module defines the state in which something should be.
when used in a task, following things happen

- if system is not in the required state, task should put it in that state
- if system is in the required state, it does nothing
- if task fails, default behaviour is to abort the rest of the playbook for the hosts that had a failure

---
references: