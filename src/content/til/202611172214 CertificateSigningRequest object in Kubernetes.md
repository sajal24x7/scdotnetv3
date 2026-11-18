---
title: CertificateSigningRequest Object in Kubernetes
slug: certificatesigningrequest-object-in-kubernetes
created: 2026-11-17T20:14:00.000Z
updated: 2026-11-17T20:29:00.000Z
category: til
tags:
  - k8s
  - cert
  - security
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117634720277939586'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3n2kdxhx2w52q'
  - 'https://www.threads.com/@sajal24x7/post/Df3RMe0oAH4'
---
This resource allows for a certificate to be issued based on a CSR (which must be base64 encoded). The object has `apiVersion` of `certificates.k8s.io/v1` and `kind` of `CertificateSigningRequest`. `signerName` is a required field.

Sample yaml:

```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: akshay
spec:
  groups:
  - system:authenticated
  # Encoded CSR 
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1ZqQ0NBVDRDQVFBd0VURVBNQTBHQTFVRUF3d0dZV3R6YUdGNU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRgpBQU9DQVE4QU1JSUJDZ0tDQVFFQW1RTy8wZFBRVzFnbGI0WE0zMFl1c0tMYndZMlhoOE1BTDRoK0tVQmpxRzlqCnpxNnlRKzVvQVBzMWhuZUJIZWFKbXVwWTQrTWlFMC9HWTVYMmVqaE9rV3ZrcENnN3pnTXZXRklLTmNiTUpCbjgKQnZrUUwrdk5LOGUwSWpNZWJ5RzQxOWhvOTA1RUtyVERZTU9GM0JnaHRJUmdRVzJuUlJBVmp3OVNUNDMwZkNxYgozYlVZQm5vZFRraFk3S3E1d1hlZkp6VVowWjR0cHFxYTNiOEw1NWE5TEdqNTIzb1JIdUJWQWpQcnhGbE9tbEkyCkRpUGk5cFZYOHdLZXJuNE9sQm9wZVROTXV2M3JGekNKd3FzeDJPVWptUGgrWDJ4YjBZV1hiZGRyL1pyaDlSWHYKOEthVXVXeW9Qb0Q3QWNVaElNTlNaM0QxQ2RDbmRSeDZITHBQaEc5WEJ3SURBUUFCb0FBd0RRWUpLb1pJaHZjTgpBUUVMQlFBRGdnRUJBRVk4YTZTbGlTa2g3YkFrOWJpaFhWQXBRSVNmaE5RbFFPZGMwK3VUQS9sNHFwa0tvbWxECkJBQ3hwbjRtbmJoMUErOG9vZ0tnRVBvcmJWdGxaTDFZOUJBbThjeUNramV4c1lkNDdwTWdENFl0UzhWWW5icmwKbGUvWVBZb3dFWHRJZFY2eFhtZDNSRlBhUk1ZSk5lbWZwVGN0U2w2ZlF3U0tFUnRaanZySk1pd280cXlVUDRTRApvbzEzVDdsWDhLVnR3bW9idzRUZ3R0WlBya1l5Mm9tZGhrcVVRVDNXRWtEaFVBeGdvdmFleHF0L2ZYc0xuekEwCkF5aDJnZ3NIODhqelY3Y1VsOVhiRUpDRmYwQVZtZGF0bXUxandNYjZ2SXI5QXJpZUZCSFFYeXpYLy9NRVRDVkkKclBSTldiTGVLNmFNbGcrU1V1SEN4YVEvMnFOV0l6K2FlVWM9Ci0tLS0tRU5EIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLQo=
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - client auth
```
