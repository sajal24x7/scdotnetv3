---
aliases:
  - Ansible Import
tags:
  - "#ansible"
category: til
updated: 2026-08-25T14:30:56
---
Previous versions used `include` directive. Which had issues (confusing and error-prone).
So, it was deprecated. 

There are two things we can do:
1. include (dynamic)
2. import (static)

# Play related

`import_playbook`

the `import_playbook` feature can only be used at the top level of a playbook and cannot be used inside a play. If you import multiple playbooks, then they will be imported and run in order.

# Task related
`include_tasks`, `import_tasks`

Plays/tasks can be variablized for reuse. 
For example, instead of 

```ansible
---
  - name: Install the httpd package
    yum:
      name: httpd
      state: latest
  - name: Start the httpd service
    service:
      name: httpd
      enabled: true
      state: started
```

It can be variablized as 

```ansible
---
  - name: Install the {{ package }} package
    yum:
      name: "{{ package }}"
      state: latest
  - name: Start the {{ service }} service
    service:
      name: "{{ service }}"
      enabled: true
      state: started
```

And variables set like so:

```ansible
tasks:
    - name: Import task file and set variables
      import_tasks: task.yml
      vars:
        package: httpd
        service: httpd
```

---
# references: