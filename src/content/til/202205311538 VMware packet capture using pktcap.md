---
title: VMware Packet Capture Using Pktcap
slug: vmware-packet-capture-using-pktcap
created: '2022-05-31T15:38:00+03:00'
updated: '2022-05-31T15:38:00+03:00'
category: til
tags:
  - vmware
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjr563ip2u'
---


## Confirm port details using command below, grep the port details for the vm we need to run it for.
``` ssh
$ net-stats -l
```

## Get list of datastores, and select one which has space to store the network capture.
```ssh
esxcli storage vmfs extent list
ls /vmfs/volumes
```

## Double ssh to the esxi which has the server and run commands for incoming and outgoing over 2 sessions (see example below)
```ssh
pktcap-uw --switchport <portnumber> --dir {0|1|2} --tcpport <TCP_port> -o <capture_location>
```
dir {0|1|2} 0 stands for incoming traffic, 1 for outgoing traffic, and 2 for bidirectional traffic.

## Use following command to kill the process on all servers once spike is observed
```ssh 
kill $(lsof |grep pktcap-uw |awk '{print $1}'| sort -u)
```

To list:
```ssh
lsof |grep pktcap-uw |awk '{print $1}'| sort -u
```

## Example

### VM1: 25903-web-ryd
Host: fiesopprdesx03.fi.tcsecp.com

net-stats -l | grep 25903-web-ryd
50331688            5       9 DvsPortset-0     fa:16:3e:74:9b:20  25903-web-ryd (68c5b741-1ce4-4637-8186-41d3c7352403).eth1
50331689            5       9 DvsPortset-0     fa:16:3e:f9:2a:94  25903-web-ryd (68c5b741-1ce4-4637-8186-41d3c7352403).eth0 (Prod)

/vmfs/volumes/5f6388f0-300d4730-0a0c-0025b501014f/pktcap

pktcap-uw --switchport 50331689 --dir 0 --tcpport 2036 -o /vmfs/volumes/5f6388f0-300d4730-0a0c-0025b501014f/pktcap/capin14.pcap
pktcap-uw --switchport 50331689 --dir 1 --tcpport 2036 -o /vmfs/volumes/5f6388f0-300d4730-0a0c-0025b501014f/pktcap/capout14.pcap


### VM2: 25903-lptl-epm
Host: fiespalaprtesx08.fi.tcsecp.com

net-stats -l | grep 25903-lptl-epm
50331694            5       9 DvsPortset-0     fa:16:3e:01:ec:7f  25903-lptl-epm (66fbb177-2dd2-4d06-91fb-df119945cb81).eth1
50331695            5       9 DvsPortset-0     fa:16:3e:b8:75:65  25903-lptl-epm (66fbb177-2dd2-4d06-91fb-df119945cb81).eth0 (Prod)

esxcli storage vmfs extent list

/vmfs/volumes/620a7fad-ea2a095e-bc75-0025b50502cf

pktcap-uw --switchport 50331695 --dir 0 --tcpport 2036 -o /vmfs/volumes/620a7fad-ea2a095e-bc75-0025b50502cf/pktcap/capin14.pcap
pktcap-uw --switchport 50331695 --dir 1 --tcpport 2036 -o /vmfs/volumes/620a7fad-ea2a095e-bc75-0025b50502cf/pktcap/capout14.pcap

---
# references:
1. [Capturing and Tracing Network Packets by Using the pktcap-uw Utility (vmware.com)](https://docs.vmware.com/en/VMware-vSphere/6.7/com.vmware.vsphere.networking.doc/GUID-5CE50870-81A9-457E-BE56-C3FCEEF3D0D5.html)
2. [Using the pktcap-uw tool in ESXi 5.5 and later (2051814) (vmware.com)](https://kb.vmware.com/s/article/2051814)
