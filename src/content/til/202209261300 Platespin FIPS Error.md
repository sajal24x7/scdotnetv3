---
title: Platespin FIPS Error
slug: platespin-fips-error
created: '2022-09-26T13:00:00+03:00'
updated: '2022-09-26T13:00:00+03:00'
category: til
tags: []
---


Error:
Exception has been thrown by the target of an invocation.
This implementation is not part of the Windows Platform FIPS validated cryptographic algorithms.

You can enable PlateSpin Migrate to suppress errors for non-compliant FIPS algorithms.
1.  In a text editor, open the ofxcontrollerexecution.exe.config file found in this folder: 
```cmd
<install folder>\PlateSpin Migrate Server\Controller\Packages\0\C863075B-8130-4d29-893B-70FF2AD9308C\1
```

3. Add the following element to the runtime section of the file:
```xml
<configuration>
    <runtime>
         ...
        <enforceFIPSPolicy enabled="false"/>
    </runtime>
</configuration>
```
3.  Save your changes.

---
references:
[https://www.microfocus.com/documentation/platespin/platespin-migrate-2019-11/migrate-user/bug1125663.html?view=print](https://www.microfocus.com/documentation/platespin/platespin-migrate-2019-11/migrate-user/bug1125663.html?view=print)