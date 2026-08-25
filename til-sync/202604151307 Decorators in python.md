---
tags:
  - python
aliases:
category: til
updated: 2026-08-25T14:30:56
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

# The decorator will sanitize '  PROD-API.local  ' to 'prod-api.local'
connect_to_host(hostname="  PROD-API.local  ")
```