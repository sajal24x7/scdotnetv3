---
tags:
  - "#ad"
  - "#windows"
aliases:
  - move fsmo roles
---
Move needs to be run with appropriate access. 
Domain wise roles need Domain Admin.
Forest wide roles need Enterprise Admin.
Requires also Schema Admin role.

```powershell

# Check roles
netdom query fsmo

# move roles 
Move-ADDirectoryServerOperationMasterRole -Identity <newdc> -OperationMasterRole PDCEmulator, RIDMaster, InfrastructureMaster

# move all 5
Move-ADDirectoryServerOperationMasterRole -Identity OPWINDC2 -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster

```

# Seize roles
- In case of issues
- Use the above command with `-Force` parameter

---
# references: