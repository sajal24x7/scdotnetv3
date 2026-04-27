---
title: Type of Machine Learning
slug: type-of-machine-learning
pubDate: '2024-03-25T23:00:00+03:00'
updatedDate: '2024-03-25T23:00:00+03:00'
category: til
tags:
- ai
---

# Supervised
Training data includes both features and known labels. Follows the process of train, validate and evaluate.
In training phase dataset is split randomly. Choose an algorithm to create a model  using half the data. Then it is validated on the remaining half, i.e. how accurate it is. Compare the known actual labels against the predicted values.
Usually data engineer will go through multiple iterations of this. And chose the one which gives the best results (evaluation metric).
## [[202403252313 Regression models|regression]]
The label is a numerical value. Like number of ice cream sold on a day.
## Classification
Label represents a categorisation or class.
### Binary classification
Label is Yes/No. True/False. Sort of a thing. Does the patient have diabetes given the features (age/background,etc.)
### Multi-class classification
Label is mutually exclusive different things. Types of dogs for example.
Also can be multilabel classification models where one observation can have more than one labels.

# Unsupervised
No lables. Algorithm figures out relations between features of observations.
## Clustering
identifies similarities between observations based on their features, and groups them into discrete clusters.

---
references:
https://learn.microsoft.com/en-in/training/modules/fundamentals-machine-learning/3-types-of-machine-learning