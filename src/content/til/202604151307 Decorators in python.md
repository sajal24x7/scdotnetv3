---
title: "Decorators in Python"
slug: "decorators-in-python"
created: 2026-04-15T13:07:00+03:00
updated: 2026-10-01T16:55:31+03:00
category: til
tags: ["python"]
---
Decorators in python are a way to extend behaviour of functions without changing the actual code of the function. So for example it can be used in scenarios like logging, etc.

Decorators can be used with arguments.

```python
import functools

def sanitize_hostname(func):
    """
    A decorator that finds a 'hostname' keyword argument, sanitizes it
	(lowercase, stripped whitespace), and passes it to the wrapped function.
    """

    @functools.wraps(func)
    def sanitize_function(*args, **kwargs):
        kwargs['hostname'] = kwargs['hostname'].strip()
        kwargs['hostname'] = kwargs['hostname'].lower()
        return func(*args, **kwargs)
        
    return sanitize_function

@sanitize_hostname
def connect_to_host(*, hostname):
    """Establishes a connection to a host."""
    print(f"Connecting to sanitized hostname: '{hostname}'")
    return f"Connected to {hostname}"

# The decorator will sanitize '  POLAR-IS.example  ' to 'polar-is.example'
connect_to_host(hostname="  PROD-API.local  ")
```