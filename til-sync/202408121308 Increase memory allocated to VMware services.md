---
tags:
  - "#vmware"
aliases:
  - Increase memory allocated to VMware services
---
# Error

PowerShell gives error when running tag related cmdlets
```powershell
Get-Tag com.vmware.vapi.std.errors.operation_not_found {'messages': [com.vmware.vapi.std.localizable_message {'id': vapi.method.input.invalid.interface, 'default_message': Cannot find service 'com.vmware.cis.data.svc.resource_model'., 'args': [com.vmware.cis.data.svc.resource_model]}], 'data':}
```

# Fix
```bash
# Get the current memory allocation value for the vmware-infraprofile service:
cloudvm-ram-size -l | grep vmware-infraprofile
    
# Increase the memory allocated to the infraprofile service: 
cloudvm-ram-size -C _<newMemValue>_ vmware-infraprofile 
    
# Confirm the new memory allocation value:
cloudvm-ram-size -l | grep vmware-infraprofile
    
# Restart the infraprofile service:
service-control --stop vmware-infraprofile && service-control --start vmware-infraprofile
```

---
# references:
[get-tagassignments and get-spbmstoragepolicy powerCLI commands fail with error com.vmware.vapi.std.errors.unauthenticated (broadcom.com)](https://knowledge.broadcom.com/external/article/316636/gettagassignments-and-getspbmstoragepoli.html)
> Cause
> - When a client (powercli) makes a call to the vapi-endpoint's introspection service (the com.vmware.vapi.std.introspection.provider vapi service), the vapi-endpoint on its turn makes calls to the introspection service of all the vapi providers behind, including the "infraprofile" vapi provider. We make that call in this release through the sidecar proxy at localhost:1080/infraprofile.
>- The infraprofile service though is not in a healthy state. In fact it is a zombie because it has failed with an Out Of Memory error earlier and does not respond to the requests.
[Manually increasing the heap memory on vCenter Server components in vCenter 6.x / 7.x (broadcom.com)](https://knowledge.broadcom.com/external/article/320871/manually-increasing-the-heap-memory-on-v.html)