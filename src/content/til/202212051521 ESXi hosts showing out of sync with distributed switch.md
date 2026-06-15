---
title: ESXi Hosts Showing out of Sync With Distributed Switch
slug: esxi-hosts-showing-out-of-sync-with-distributed-switch
created: '2022-12-05T15:21:00+03:00'
updated: '2022-12-05T15:21:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754728226480970'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkjgfgey2m'
  - 'https://www.threads.com/@sajal24x7/post/DZnGDjVFk_U'
---


Fix:
1.  Move all attached virtual machines to another host or to a standard switch.
    
    1.  A new standard switch can be built using one of the physical adapters that passes the correct VLANs from the vDS. See the note below on Load Balancing information.
        
2.  Move all vmkernels from the vDS to a standard switch.
    
    1.  Again, a new standard switch can be built using one of the physical adapters that passes the correct VLANs from the vDS. See the note below on Load Balancing information.
        
3.  Remove any remaining physical adapters from the vDS.
    
4.  Remove the host from the vDS. Click Home > Networking. Right click the vDS, click Add and Manage Hosts > Remove Hosts, and follow the wizard.
    
5.  Add the host back to the vDS along with its vmkernels, physical adapters, and VMs.

---
references:
[ESXi hosts showing out of sync with distributed switch (76959) (vmware.com)](https://kb.vmware.com/s/article/76959)
