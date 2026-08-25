---
aliases:
  - []
tags:
  - "#inprogress"
category: til
updated: 2026-08-25T14:30:56
---
HA is about minimizing failure.
FT is about minimizing failure + operating through failures

High Availability (HA)

-   Aims to **ensure** an agreed level of operational **performance**, usually **uptime**, for a **higher than normal period**
-   Instead of diagnosing the issue, if you have a process ready to replace it, it can be fixed quickly and probably in an automated way.
-   Spare infrastructure ready to switch customers over to in the event of a disaster to minimize downtime
-   User disruption is not ideal, but is allowed
    -   The user might have a small disruption or might need to log back in.
-   Maximizing a system's uptime
    -   99.9% (Three 9's) = 8.7 hours downtime per year.
    -   99.999 (Five 9's) = 5.26 minutes downtime per year.

## Fault-Tolerance (FT)

-   System can **continue operating properly** in the event of the **failure of some** (one or more faults within) of its**components**
-   Fault tolerance is much more complicated than high availability and more expensive. Outages must be minimized and the system needs levels of redundancy.
-   An airplane is an example of system that needs Fault Tolerance. It has more engines than it needs so it can operate through failure.

Example: A patient is waiting for a life saving surgery and is under anesthetic. While being monitored, the life support system is dosing medicine. This type of system cannot only be highly available, even a movement of interruption is deadly.

## Disaster Recovery (DR)

-   Set of policies, tools and procedures to **enable the recovery** or **continuation** of **vital** technology infrastructure and systems **following a natural or human-induced disaster**.
-   DR can largely be automated to eliminate the time for recovery and errors.

---
references: