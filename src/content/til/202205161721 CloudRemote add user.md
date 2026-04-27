---
title: CloudRemote Add User
slug: cloudremote-add-user
pubDate: '2022-05-16T17:21:00+03:00'
updatedDate: '2022-05-16T17:21:00+03:00'
category: til
tags:
- ccs
---


- First we needed to access the remote MQ by browsing the IP and to port 15672 on the CloudRemote VM

Example: [http://10.45.99.206:15672/#/users](http://10.45.99.206:15672/#/users)

- Next login using "cliqr" user and find the password in the content of /etc/rabbitmq/password in the rabbitmq container found in the docker running in the same MQ server

- Next proceeded to add the cliqr_worker with password cliqr_worker in the users

- Next we added full permissions on the vhost root for the cliqr_worker user (for both / and <endpointid>).

VMW cloud remotes

![[Pasted image 20220517092204.png]]

![[Pasted image 20220517092234.png]]

![[Pasted image 20220517092240.png]]

![[Pasted image 20220517092250.png]]
---
references: