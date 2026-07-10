---
tags:
  - python
aliases:
  - How to create a copy of an existing dictionary
category: til
---
In Python variables store reference to values and not values. Dictionaries are mutable, so, `new_dict = old_dict` does not create a new dictionary. Both are references to the same value, so changing the new dictionary changes the old dictionary as well.

If you want to copy a dictionary, use `dict` keyword, like so 

```python
old_dict = {'key':'value'}
new_dict = dict(old_dict)
```