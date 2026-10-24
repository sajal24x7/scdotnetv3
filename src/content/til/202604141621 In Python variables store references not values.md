---
title: "In Python Variables Store References Not Values"
slug: "in-python-variables-store-references-not-values"
created: 2026-04-14T16:21:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["python"]
---
In Python variables store reference to values and not values. Dictionaries are mutable, so, `new_dict = old_dict` does not create a new dictionary. Both are references to the same value, so changing the new dictionary changes the old dictionary as well.

If you want to copy a dictionary, use `dict` keyword, like so 

```python
old_dict = {'key':'value'}
new_dict = dict(old_dict)
```