---
title: AAP Controller Rbac
slug: aap-controller-rbac
created: '2023-01-20T11:47:00+03:00'
updated: '2023-01-20T11:47:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754734572004388'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkmcv5f52m'
---


# Users
Three types of users:
1. System Administrator (superuser/provides read/write permission on all objects in all organizations on the automation controller)
2. System Auditor (has read-only access to the entire automation controller installation)
3. Normal User (starts with no access/granted access based on org/team)

> Users are system wide. 
> A team belongs to exactly one organization.
> An admin user can assign the team roles on resources that belong to other organizations

# Teams
Roles in a team: 
1. Admin (full control on team/can manage membership/can manage roles on resources if team has admin role on the resource)
2. Member (gets roles assigned to team/can see other team users and their roles)
3. Read (can see other team users and their roles)

> In practice, most organizations do not use team roles other than `Member`. Instead, team membership is managed through an external authentication source, or the `Organization Administrator` and `System Administrator` roles are used for administrative purposes and `System Auditor` for auditing requirements instead of `Read` on individual teams.


# Organizations

Roles in an org:
1. Execute (execute job templates/workflow job templates)
2. Admin (full access on everything in an org)
3. Project Admin (full access incl. create on all projects)
4. Inventory Admin (full access on inventories, inc. create)
5. Credential Admin (manage all credentials)
6. Workflow Admin (manage all workflows)
7. Notification Admin (manage all notifications)
8. Job Template Admin (can make changes to non-sensitive fields)
9. Execution Environment Admin (manage all execution environments)
10. Auditor (RO access to the org)
11. Read (read permission to org only/see users and their roles/does not inherit roles on objects)
12. Approve (approve/deny workflow approval)

> Project + Inventory Admin --> Create job templates
> Project + Inventory + Job Template Admin --> Full control over job templates



---
# references:
[8. Users — Automation Controller User Guide v4.3 (ansible.com)](https://docs.ansible.com/automation-controller/latest/html/userguide/users.html)
[7. Organizations — Automation Controller User Guide v4.3 (ansible.com)](https://docs.ansible.com/automation-controller/latest/html/userguide/organizations.html)
