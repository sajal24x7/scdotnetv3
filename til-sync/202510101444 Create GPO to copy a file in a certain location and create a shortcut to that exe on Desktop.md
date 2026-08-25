---
aliases:
  - Create GPO to copy a file in a certain location and create a shortcut to that exe on Desktop
tags:
  - "#windows"
  - "#gpo"
  - "#shortcut"
category: til
updated: 2026-08-25T14:30:56
---
## Copy a file

1. Run gpmc.msc
2. Go to `Computer Configuration` → `Preferences` → `Windows Settings` → `Files`
3. Right-click → **New** → **File**.
4. Set:
    - **Action**: `Create`
    - **Source file**: `\\YourServer\SharedFolder\App.exe`
    - **Destination file**: `C:\Program Files\AppFolder\App.exe`  
        _(Create_ `_AppFolder_` _if needed)_
5. Optionally, set **"Run in logged-on user's security context"** if needed.

## Create Desktop Shortcut**

1. Navigate to:  
    `User Configuration` → `Preferences` → `Windows Settings` → `Shortcuts`
2. Right-click → **New** → **Shortcut**.
3. Set:
    - **Action**: `Create`
    - **Name**: `App Shortcut`
    - **Target type**: `File System Object`
    - **Location**: `All Users Desktop`
    - **Target path**: `C:\Program Files\AppFolder\App.exe`
    - **Icon file path**: _(optional)_`