---
title: "Types of Encryption"
slug: "types-of-encryption"
created: 2026-11-05T21:57:00+02:00
updated: 2026-11-05T22:14:59+02:00
category: til
tags: ["security", "encryption"]
---
There are two types:
1. Symmetric Key Encryption
2. Asymmetric Key Encryption


## Symmetric Key Encryption

In Symmetric, the same key is used to both encrypt and decrypt a message. So an adversary can sniff both the message and the key while it is in transit and decrypt it.


## Asymmetric Key Encryption

Asymmetric uses a pair of related keys - a public and a private key. The security is in keeping the private key secret. 

For example, for SSH, you generate a private key and public key. Then put the public key on the server. Now, when you ssh with your private key, you can login. 

Another example is when you try to access a website on https, the site generates a key pair, it passes the public key back to you. Then you (browser) encrypts the private key with the public key supplied by the server. Then it passes this to the web server. The web server decrypts the message with its private key and gets the users private key. All future messages encrypted by the user can be decrypted at the server.

The hacker in this case does not have the private key of the server in order to get the user's private key. So the messages are secure.