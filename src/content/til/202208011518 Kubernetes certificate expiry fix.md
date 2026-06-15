---
title: Kubernetes Certificate Expiry Fix
slug: kubernetes-certificate-expiry-fix
created: '2022-08-01T15:18:00+03:00'
updated: '2022-08-01T15:18:00+03:00'
category: til
tags:
- k8s
- ccs
---


# Check cert status
```bash
$ sudo kubeadm alpha certs check-expiration
CERTIFICATE                EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
admin.conf                 Aug 01, 2023 11:47 UTC   364d            no
apiserver                  Aug 01, 2023 11:47 UTC   364d            no
apiserver-etcd-client      Aug 01, 2023 11:47 UTC   364d            no
apiserver-kubelet-client   Aug 01, 2023 11:47 UTC   364d            no
controller-manager.conf    Aug 01, 2023 11:47 UTC   364d            no
etcd-healthcheck-client    Aug 01, 2023 11:47 UTC   364d            no
etcd-peer                  Aug 01, 2023 11:47 UTC   364d            no
etcd-server                Aug 01, 2023 11:47 UTC   364d            no
front-proxy-client         Aug 01, 2023 11:47 UTC   364d            no
scheduler.conf             Aug 01, 2023 11:47 UTC   364d            no
```

# New Method
1. Download ccp-utils-aa166c3.tar to master nodes.
2. Untar.
3. On all the master nodes, run the following:
``` bash
python3 renew_certs.py -s
```
4. Reboot the master nodes one at a time
```bash
shutdown -r now
```
6. run the following script: ./renew_kubeconfig_secret.sh. It creates a script in /tmp location (/tmp/update_kubeconf_secret.sh) which needs to be updated with correct secret name.
7. Get the secret name using:
```bash
$ kubectl get secret -n ccp | grep kubeconfig
fit-ba52bfdd-4bc5-4307-b788-b4f0620ec7f8-kubeconfig     Opaque                                10     2y19d
```
8. Update the /tmp script with -n ccp and the name of the cert, like so
``` bash
kubectl -n ccp get secret "fit-ba52bfdd-4bc5-4307-b788-b4f0620ec7f8-kubeconfig" -o yaml >  "fit-ba52bfdd-4bc5-4307-b788-b4f0620ec7f8-kubeconfig".bak
kubectl -n ccp patch secret "fit-ba52bfdd-4bc5-4307-b788-b4f0620ec7f8-kubeconfig" --type="json"
```
9. After updating it, run the script.
10. Verify node status using get nodes, get pods, etc.


# Old Method

[Cisco documentation]()

[Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/)

[Kubernetes Alpha Kubeadm Documentation](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-alpha/)

  

1. Log in to a master node, and sudo su - to become root.

2. Backup your old certificates and keys. This is not required but recommended. Make a backup directory and copy these files to it.  

```bash

$ sudo cp -a /etc/kubernetes/ .

```

3. Use kubeadm alpha certs to renew the certificates:

```bash

admin@ccs-52-rcdn-74601e81-d5f0-4178-mg-1-1201e401a1:/etc/kubernetes$ sudo kubeadm alpha certs renew all --v=5

```

4. Regenerate the kubernetes .conf files by kubeadm alpha kubeconfig:

```bash

kubeadm alpha kubeconfig user --org system:masters --client-name kubernetes-admin > /etc/kubernetes/admin.conf

kubeadm alpha kubeconfig user --client-name system:kube-controller-manager > /etc/kubernetes/controller-manager.conf

kubeadm alpha kubeconfig user --client-name system:kube-scheduler > /etc/kubernetes/scheduler.conf

kubeadm alpha kubeconfig user --org system:nodes --client-name system:node:$(hostname) > /etc/kubernetes/kubelet.conf

```

5. If there is a file /etc/kubernetes/node.conf in the system, replace it with a copy of the new admin.conf file and edit it to replace the VIP with the local IP of the node:

```bash

cp /etc/kubernetes/admin.conf /etc/kubernetes/node.conf

vi node.conf

```

6. Export your new admin.conf file to your host.
   
```bash

cp -i /etc/kubernetes/admin.conf $HOME/.kube/config

chown $(id -u):$(id -g) $HOME/.kube/config

chmod 777 $HOME/.kube/config

export KUBECONFIG=.kube/config

```

  
7. Reboot the master node via shutdown -r now.

8. Perform above steps for all master nodes.

9. Verify kubernetes status using kubectl get nodes.

10. Only do steps 19-25 on each worker IF they show as NotReady and having issues. On later clusters you might not have to do this. On one master, generate a new join token via kubeadm token create --print-join-command. Copy that command for later use.

  

```bash

[root@cx-ccs-prod-master-d7f34f25-f524-4f90-9037-7286202ed13a1 k8s-mgmt]# kubeadm token create --print-join-command

kubeadm join 192.168.1.14:6443 --token m1ynvj.f4n3et3poki88ry4

 --discovery-token-ca-cert-hash

sha256:4d0c569985c1d460ef74dc01c85740285e4af2c2369ff833eed1ba86e1167575

```

---
references: