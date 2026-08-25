---
aliases:
  - move fsmo roles
tags:
  - ad
  - windows
category: til
updated: 2026-08-25T14:30:56
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
Move-ADDirectoryServerOperationMasterRole -Identity KEHIDC1 -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster

```

# Seize roles
- In case of issues
- Use the above command with `-Force` parameter

---
# references: