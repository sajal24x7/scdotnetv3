---
title: Jinja2 Reference
slug: jinja2-reference
created: '2022-04-27T16:56:00+03:00'
updated: '2022-04-27T16:56:00+03:00'
category: til
tags:
  - jinja
  - ansible
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modhnrwzbb2v'
---


Jinja2 is used for templating.

# String manipulation
## Substitution
```jinja
The name is {{ name }}
```

## Upper case
```jinja
The name is {{ name|upper }}
```

## Title Case
```jinja
{{ book_name|title }}
```

## Replace
```jinja
{{ dialogue | replace("Bourne","Bond") }}
```

# Array
## Highest number in an array
```jinja
{{ numbers | max }}
```

## Last number in an array
```jinja
{{ numbers | last }}
```

## Join
```jinja
{{ words | join(' ') }}
```

## Number of words
```jinja
{{ words | wordcount }}
```

# Loops
```jinja
{% for name_server in name_servers -%}
nameserver {{ name_server }}
{% endfor %}
```

Input:
```json
{
  "hosts": [
    {
      "name": "web1",
      "ip_address": "192.168.5.4"
    },
    {
      "name": "web2",
      "ip_address": "192.168.5.5"
    },
    {
      "name": "web3",
      "ip_address": "192.168.5.8"
    },
    {
      "name": "db1",
      "ip_address": "192.168.5.9"
    }
  ]
}
```
```jinja
{% for host in hosts -%}
{{ host.name }} {{ host.ip_address }}
{% endfor %}
```

## IF
```jinja
{% for host in hosts -%}
  {% if "web" in host.name %}
{{ host.name }} {{ host.ip_address }}
  {% endif %}
{% endfor %}
```
---
references:
[Jinja | The Pallets Projects](https://palletsprojects.com/p/jinja/)
[Jinja — Jinja Documentation (3.1.x) (palletsprojects.com)](https://jinja.palletsprojects.com/en/3.1.x/)
