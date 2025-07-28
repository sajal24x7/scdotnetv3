---
title: Kubernetes Pods Certificate Related
slug: kubernetes-pods-certificate-related
pubDate: '2022-09-21T12:51:00+03:00'
updatedDate: '2022-09-21T12:51:00+03:00'
category: til
tags: []
---


## Rabbitmq Cert health status - should be ok for both

kubectl -n cisco exec -t cloudcenter-shared-rabbitmq-0 -- bash -c "openssl verify -verbose -CAfile /secrets/c2ssl/ca/ca_certificate.pem /secrets/c2ssl/cert/certificate.pem"

## To check duration for certificates

``` bash

kubectl get certs --all-namespaces  -o=custom-columns=NAME:.metadata.name,SECRET:.spec.duration

```

## To check expiry date for certificates, sorted earliest expiry to latest

``` bash
kubectl get cert -A -o jsonpath='{range .items[*]}{.status.notAfter}{"\t"}{.metadata.namespace}{"\t"}{.metadata.name}{"\n"} {end}' | sort -n

kubectl -n cisco get secret -o wide | grep 'kubernetes.io/tls' | awk '{print $1}' | xargs -i sh -c "printf '%-50s; %-5s' {}; kubectl -n cisco get secret {} -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -enddate"
```

  

## To check for expiry date for certificates

  

``` bash

for s in `kubectl get secrets -n cisco | grep  "kubernetes.io/tls" | awk '{ print $1 }'`; do dend=`kubectl get secret $s -n cisco -o json | jq -r '.data."tls.crt"' | base64 -d | openssl x509 -enddate -noout`; echo $s\t$dend; done;

```

  

## Instructions to perform activity for setting cert duration

  

There are actually 2 more things we will need to do, note that it will require a downtime.

  

1. Recreate the “duration” variable which was deleted from the certificate by the old (now removed) cert-manager.

2. Regenerate the certificate.  Regarding this second point (steps 3 and 4 below), it should normally be done automatically, but the engineering team couldn’t give the guarantee that it will happen so they suggested to regenerate manually the certificates, which requires a downtime to restart the pods.

  

Here are script format of the different activities this will require.

  

1. Collect a backup of all the certificates and secrets in case something goes wrong (create a script and execute it):

  

``` bash

#!/bin/bash

namespace="cisco"

mkdir -p $namespace

for n in $(kubectl -n $namespace get secrets -o custom-columns=:metadata.name | grep -v 'service-account')

do

    echo "Saving $namespace/secret_$n..."

    kubectl -n $namespace get secret $n -o yaml > $namespace/secret_$n.yaml

done

for n in $(kubectl -n $namespace get cert -o custom-columns=:metadata.name)

do

    echo "Saving $namespace/cert_$n..."

    kubectl -n $namespace get cert $n -o yaml > $namespace/cert_$n.yaml

done

```

  

2. Update the duration field in all the certificates (create a script and execute it):

  

``` bash

#! /bin/bash

for s in $(kubectl -n cisco get certs -o=custom-columns=NAME:.metadata.name,SECRET:.spec.secretName | tail -n +2 | awk '{print $1}')

do

    kubectl patch cert $s --patch '{"spec": {"duration": "19680h"}}' --type=merge -n cisco

done

```

  

3. Delete the secrets storing the old certificates (run the command), ignore the error “error: resource(s) were provided, but no name, label selector, or --all flag specified”:

  

``` bash

kubectl -n cisco get cert -o jsonpath='{range .items[*]}{.spec.secretName}{"\n"}' | awk '{cmd="kubectl -n cisco delete secret "$1; system(cmd)}'

```

  

4. Restart all the pods to regenerate the certificates (this generates a downtime of several minutes).

  

``` bash

kubectl delete --all pods -n=cisco

```

  

>Step 2 is required and can be performed whenever you want (I suggest to do it as soon as possible).  

>Regarding steps 3 and 4, either plan at your earliest convenience or first monitor the certificates to see if they get automatically renewed using the command below.  This second option has the advantage to probably require no downtime, but require some monitoring.

  

``` bash

kubectl get cert -A -o jsonpath='{range .items[*]}{.status.notAfter}{"\t"}{.metadata.namespace}{"\t"}{.metadata.name}{"\n"} {end}' | sort -n

```

  

The backup taken in step 1 can be restored using this script:

  

``` bash

#!/bin/bash

namespace=cisco

echo "Restoring Opaque Secrets via YAML.."

for n in $namespace/*.yaml; do

        [ -f "$n" ] || break

        if [[ $n =~ "secret_" ]]; then

                echo "Restoring Secret via yaml file $n..."

                kubectl apply -f "$n"

        fi

done

echo "Restoring Certs via YAML"

for n in $namespace/*.yaml; do

        [ -f "$n" ] || break

        if [[ $n =~ "cert" ]]; then

                echo "Restoring Cert via yaml file $n..."

                kubectl apply -f "$n"

        fi

done

  

echo "Restarting all CCS Pods..."

kubectl delete --all pods --namespace=$namespace

```
---
references: