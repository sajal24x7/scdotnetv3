---
tags:
  - terraform
aliases:
---

# Commands
```bash
# To build image from dockerfile
docker build -t tcs/customworker:1.0.1 . 

# To build from existing image
# Run an ephemeral container and bash into it
docker run --rm -it hashicorp/build-worker:now /bin/bash
```

# Directory
Directory must contain dockerfile, and anyother files that need to be part of the image (certs, provider files,etc.)

# Dockerfile
Idea is to use the existing terraform worker image and then copy the required files to it and then that's it.
Terraform default worker image is based on ubuntu.
```dockerfile

FROM hashicorp/build-worker:now

# Include all necessary CA certificates.
ADD chain.crt /usr/local/share/ca-certificates/

# Create provider directory
RUN mkdir /usr/share/terraform
RUN mkdir /usr/share/terraform/providers
RUN mkdir /usr/share/terraform/providers/registry.terraform.io

# Add providers to the image
ADD providers/* /usr/share/terraform/providers/registry.terraform.io

# Add init script
ADD init_custom_worker.sh /usr/local/bin/init_custom_worker.sh

# Update the CA certificates bundle to include newly added CA certificates.
RUN update-ca-certificates

```

# Initialization script
Script must be kept at /usr/local/bin/init_custom_worker.sh
This basically adds the custom provider location.
To do testing add a sleep command to the end of init script and run docker exec to use bash.
```bash
#!/bin/bash

cat >> /tmp/cli.tfrc <<EOF
provider_installation {
 filesystem_mirror {
   path    = "/usr/share/terraform/providers"
   include = ["*/*"]
 }
}
EOF
```

# Configure TFE to use custom worker
Make sure that Terraform Enterprise is configured to use the custom worker image by opening the installer dashboard at port 8800 of the installation and choosing **Settings** > **Terraform Build Worker Image** > **Provide the location of a custom image**.

---
references:
1. [How To Set Up Provider Installation in Terraform Enterprise – HashiCorp Help Center](https://support.hashicorp.com/hc/en-us/articles/1500001875182-How-To-Set-Up-Provider-Installation-in-Terraform-Enterprise#:~:text=%20Procedure%20%201%20In%20order%20to%20add,Please%20note%20that%20there%20are%20strict...%20More%20)
2. [Interactive Installation - Install and Config - Terraform Enterprise | Terraform by HashiCorp](https://www.terraform.io/enterprise/install/interactive/installer#alternative-terraform-worker-image)
3. [TFE alternative worker git](https://github.com/straubt1/tfe-alternative-worker)