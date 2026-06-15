---
title: Jinja2 Reference
slug: jinja2-reference
created: '2022-04-27T16:56:00+03:00'
updated: '2022-04-27T16:56:00+03:00'
category: til
tags:
- jinja
- ansible
---


Jinja2 is used for templating.

# String manipulation
## Substitution
``` jinja2
The name is {{ name }}
```

## Upper case
```jinja2
The name is {{ name|upper }}
```

## Title Case
```jinja2
{{ book_name|title }}
```

## Replace
```jinja2
{{ dialogue | replace("Bourne","Bond") }}
```

# Array
## Highest number in an array
```jinja2
{{ numbers | max }}
```

## Last number in an array
```jinja2
{{ numbers | last }}
```

## Join
```jinja2
{{ words | join(' ') }}
```

## Number of words
```jinja2
{{ words | wordcount }}
```

# Loops
```jinja2
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
```jinja2
{% for host in hosts -%}
{{ host.name }} {{ host.ip_address }}
{% endfor %}
```

## IF
```jinja2
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