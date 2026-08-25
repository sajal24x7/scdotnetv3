---
aliases:
  - Install offline plugin notepad ++
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
[x64 plugin list](https://github.com/notepad-plus-plus/nppPluginList/blob/master/doc/plugin_list_x64.md)

1. Dowload the plugin and extract the plugin dll file.
2. Place the plugin.dll file under plugin folder of notepad++ installation. For me it was : `C:\Program Files\Notepad++\plugins`
3. Start Notepad++ as an elevated administrator and then go to: `Settings -> Import -> Import plugin(s)...` (import the plugin).
4. Notepad++ will show the restart message. / Sometimes it may not show it.
5. Restart the notepad++.
6. Should see new plugin under the Plugins menu. ALL DONE!!

---
# references:
[How to install a Notepad++ plugin offline? - Stack Overflow](https://stackoverflow.com/questions/40015350/how-to-install-a-notepad-plugin-offline)