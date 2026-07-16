---
title: Ansible Import
slug: ansible-import
created: '2023-01-18T17:17:00+03:00'
updated: '2023-01-18T17:17:00+03:00'
category: til
tags:
  - ansible
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754733995340334'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkm2fd232u'
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

```yaml
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

```yaml
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

```yaml
tasks:
    - name: Import task file and set variables
      import_tasks: task.yml
      vars:
        package: httpd
        service: httpd
```

---
# references:
