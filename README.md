# Huly Platform

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/huly_io?style=for-the-badge)](https://x.com/huly_io)
![GitHub License](https://img.shields.io/github/license/hcengineering/platform?style=for-the-badge)

⭐️ Your star shines on us. Star us on GitHub!

## About

The Huly Platform is a robust framework designed to accelerate the development of business applications, such as CRM systems. 
This repository includes several applications, such as Chat, Project Management, CRM, HRM, and ATS. 
Various teams are building products on top of the Platform, including [Huly](https://huly.io) and [TraceX](https://tracex.co).

![Huly](https://repository-images.githubusercontent.com/392073243/6d27d5cc-38cd-4d88-affe-bb88b393180c)

## Self-Hosting

If you're primarily interested in self-hosting Huly without the intention to modify or contribute to its development, please use [huly-selfhost](https://github.com/hcengineering/huly-selfhost). 
This project offers a convenient method to host Huly using `docker`, designed for ease of use and quick setup. Explore this option to effortlessly enjoy Huly on your own server.

## Activity

![Alt](https://repobeats.axiom.co/api/embed/c42c99e21691fa60ea61b5cdf11c2e0647621534.svg "Repobeats analytics image")

## Table of Content

- [Huly Platform](#huly-platform)
  - [About](#about)
  - [Self-Hosting](#self-hosting)
  - [Activity](#activity)
  - [Table of Content](#table-of-content)
  - [Pre-requisites](#pre-requisites)
  - [Verification](#verification)
  - [Installation](#installation)
  - [Build and run](#build-and-run)
  - [Run in development mode](#run-in-development-mode)
  - [Update project structure and database](#update-project-structure-and-database)
  - [Troubleshooting](#troubleshooting)
  - [Build \& Watch](#build--watch)
  - [Tests](#tests)
    - [Unit tests](#unit-tests)
    - [UI tests](#ui-tests)
  - [Package publishing](#package-publishing)
  - [Additional testing](#additional-testing)

## Pre-requisites

- Before proceeding, ensure that your system meets the following requirements:
  - [Node.js](https://nodejs.org/en/download/) (v20.11.0 is required)
  - [Docker](https://docs.docker.com/get-docker/)
  - [Docker Compose](https://docs.docker.com/compose/install/)

## Verification

To verify the installation, perform the following checks in your terminal:

- Ensure that the `docker` commands are available:
  ```bash
  docker --version
  docker compose version
## Fast start

```bash
sh ./scripts/fast-start.sh
```

## Installation

You need Microsoft's [rush](https://rushjs.io) to install application.

1. Install Rush globally using the command:
   ```bash
   npm install -g @microsoft/rush
2. Navigate to the repository root and run the following commands:
   ```bash
   rush install
   rush build
Alternatively, you can just execute:

```bash
sh ./scripts/presetup-rush.sh
```

## Build and run

Development environment setup requires Docker to be installed on system.

Support is available for both amd64 and arm64 containers on Linux and macOS.

```bash
cd ./dev/
rush build    # Will build all the required packages. 
# rush rebuild  # could be used to omit build cache.
rush bundle   # Will prepare bundles.
rush package  # Will build all webpack packages.
rush validate # Will validate all sources with typescript and generate d.ts files required for ts-node execution.
rush svelte-check # Optional. svelte files validation using svelte-check.
rush docker:build   # Will build Docker containers for all applications in the local Docker environment.
rush docker:up # Will set up all the containers
```

Be aware `rush docker:build` will automatically execute all required phases like build, bundle, package.

Alternatively, you can just execute:

```bash
sh ./scripts/build.sh
```

By default, Docker volumes named dev_db, dev_elastic, and dev_files will be created for the MongoDB, Elasticsearch, and MinIO instances.

Before you can begin, you need to create a workspace and an account and associate it with the workspace.

```bash
cd ./tool # dev/tool in the repository root
rushx run-local create-workspace ws1 -w DevWorkspace # Create workspace
rushx run-local create-account user1 -p 1234 -f John -l Appleseed # Create account
rushx run-local configure ws1 --list --enable '*' # Enable all modules, even if they are not yet intended to be used by a wide audience.
rushx run-local assign-workspace user1 ws1 # Assign workspace to user.
rushx run-local confirm-email user1 # To allow the creation of additional test workspaces.

```
contact calendar tracker board document documents
chunter------------- true
calendar------------ true
recruit------------- true
telegram------------ true
lead---------------- true
gmail--------------- true
inventory----------- true
hr------------------ true
tracker------------- true
document------------ true
board--------------- true
bitrix-------------- true
love---------------- true
documents----------- true
training------------ true
products------------ true

Alternatively, you can just execute:

```bash
sh ./scripts/create-workspace.sh
```

Accessing the URL http://localhost:8087 will lead you to the app in production mode.

Limitations:

- Local installation does not support sending emails, thus disabling functionalities such as password recovery and email notifications.
- Integrations with Telegram, Gmail, and other content sources are exclusively available as Docker containers, sourced from private repositories. However, these integrations are fully functional and can be utilized with the platform.

## Run in development mode

Development mode allows for live reloading and a smoother development process.

```bash
cd dev/prod
rushx dev-server
```

Then go to http://localhost:8080

Use the following login credentials:

```plain
Email: user1
Password: 1234
Workspace: ws1
```

## Update project structure and database

If the project's structure is updated, it may be necessary to relink and rebuild the projects.

```bash
rush update
rush build
```

It may also be necessary to upgrade the running database.

```bash
cd ./dev/tool
rushx upgrade -f
```

## Troubleshooting

If a build fails, but the code is correct, try to delete the [build cache](https://rushjs.io/pages/maintainer/build_cache/) and retry.

```bash
# from the project root
rm -rf common/temp/build-cache
```

## Build & Watch

For development purpose `rush build:watch` action could be used.

It includes build and validate phases in watch mode.

## Tests

### Unit tests

```bash
rush test # To execute all tests

rushx test # For individual test execution inside a package directory
```

### UI tests

```bash
cd ./tests
rush build
rush bundle
rush docker:build
## creates test Docker containers and sets up test database
./prepare.sh
## runs UI tests
rushx uitest
```

To execute tests in the development environment, please follow these steps:

```bash
cd ./tests
./create-local.sh ## use ./restore-local.sh if you only want to restore the workspace to a predefined initial state for sanity.
cd ./sanity
rushx dev-uitest # To execute all tests against the development environment.
rushx dev-debug -g 'pattern' # To execute tests in debug mode with only the matching test pattern.
```

## Package publishing

```bash
node ./common/scripts/bump.js -p projectName
```

## Additional testing

This project is tested with BrowserStack.

<sub><sup>&copy; 2024 <a href="https://hardcoreeng.com">Hardcore Engineering Inc</a>.</sup></sub>

=[ FROM CACHE: 284 operations ]===============================================

These operations were restored from the build cache:
  @hcengineering/account (build)                                  0.16 seconds
  @hcengineering/platform (build)                                 0.15 seconds
  @hcengineering/core (build)                                     0.30 seconds
  @hcengineering/contact (build)                                  0.06 seconds
  @hcengineering/ui (build)                                       0.03 seconds
  @hcengineering/theme (build)                                    0.09 seconds
  @hcengineering/analytics (build)                                0.11 seconds
  @hcengineering/templates (build)                                0.16 seconds
  @hcengineering/view (build)                                     0.17 seconds
  @hcengineering/preference (build)                               0.03 seconds
  @hcengineering/client-resources (build)                         0.04 seconds
  @hcengineering/client (build)                                   0.02 seconds
  @hcengineering/rpc (build)                                      0.14 seconds
  @hcengineering/model (build)                                    0.04 seconds
  @hcengineering/storage (build)                                  0.04 seconds
  @hcengineering/server-backup (build)                            0.04 seconds
  @hcengineering/server-tool (build)                              0.05 seconds
  @hcengineering/rank (build)                                     0.04 seconds
  @hcengineering/server-token (build)                             0.14 seconds
  @hcengineering/server-core (build)                              0.22 seconds
  @hcengineering/text (build)                                     0.10 seconds
  @hcengineering/query (build)                                    0.03 seconds
  @hcengineering/server (build)                                   0.07 seconds
  @hcengineering/server-ws (build)                                0.06 seconds
  @hcengineering/uws (build)                                      1.68 seconds
  @hcengineering/mongo (build)                                    0.04 seconds
  @hcengineering/minio (build)                                    0.03 seconds
  @hcengineering/elastic (build)                                  0.06 seconds
  @hcengineering/middleware (build)                               0.06 seconds
  @hcengineering/server-preference (build)                        0.02 seconds
  @hcengineering/server-storage (build)                           0.03 seconds
  @hcengineering/s3 (build)                                       0.04 seconds
  @hcengineering/model-all (build)                                0.04 seconds
  @hcengineering/model-core (build)                               0.28 seconds
  @hcengineering/model-view (build)                               0.06 seconds
  @hcengineering/view-resources (build)                           0.19 seconds
  @hcengineering/panel (build)                                    0.03 seconds
  @hcengineering/chunter (build)                                  0.04 seconds
  @hcengineering/activity (build)                                 0.03 seconds
  @hcengineering/notification (build)                             0.02 seconds
  @hcengineering/setting (build)                                  0.03 seconds
  @hcengineering/presentation (build)                             0.04 seconds
  @hcengineering/collaborator-client (build)                      0.05 seconds
  @hcengineering/calendar (build)                                 0.03 seconds
  @hcengineering/guest (build)                                    0.14 seconds
  @hcengineering/task (build)                                     0.14 seconds
  @hcengineering/text-editor (build)                              0.04 seconds
  @hcengineering/text-editor-resources (build)                    0.04 seconds
  @hcengineering/model-preference (build)                         0.04 seconds
  @hcengineering/model-presentation (build)                       0.03 seconds
  @hcengineering/model-workbench (build)                          0.08 seconds
  @hcengineering/workbench (build)                                0.02 seconds
  @hcengineering/workbench-resources (build)                      0.02 seconds
  @hcengineering/login (build)                                    0.02 seconds
  @hcengineering/request (build)                                  0.03 seconds
  @hcengineering/notification-resources (build)                   0.22 seconds
  @hcengineering/activity-resources (build)                       0.04 seconds
  @hcengineering/contact-resources (build)                        0.02 seconds
  @hcengineering/attachment-resources (build)                     0.04 seconds
  @hcengineering/attachment (build)                               0.02 seconds
  @hcengineering/image-cropper (build)                            0.19 seconds
  @hcengineering/support (build)                                  0.06 seconds
  @hcengineering/support-resources (build)                        0.01 seconds
  @hcengineering/model-contact (build)                            0.19 seconds
  @hcengineering/model-activity (build)                           0.04 seconds
  @hcengineering/model-attachment (build)                         0.09 seconds
  @hcengineering/model-chunter (build)                            0.19 seconds
  @hcengineering/chunter-resources (build)                        0.02 seconds
  @hcengineering/model-notification (build)                       0.04 seconds
  @hcengineering/model-guest (build)                              0.13 seconds
  @hcengineering/guest-resources (build)                          0.03 seconds
  @hcengineering/model-task (build)                               0.03 seconds
  @hcengineering/model-tags (build)                               0.13 seconds
  @hcengineering/tags (build)                                     0.03 seconds
  @hcengineering/tags-resources (build)                           0.10 seconds
  @hcengineering/task-resources (build)                           0.11 seconds
  @hcengineering/kanban (build)                                   0.23 seconds
  @hcengineering/setting-resources (build)                        0.20 seconds
  @hcengineering/model-recruit (build)                            0.04 seconds
  @hcengineering/model-calendar (build)                           0.03 seconds
  @hcengineering/calendar-resources (build)                       0.14 seconds
  @hcengineering/model-setting (build)                            0.14 seconds
  @hcengineering/model-gmail (build)                              0.05 seconds
  @hcengineering/model-love (build)                               0.15 seconds
  @hcengineering/drive (build)                                    0.13 seconds
  @hcengineering/love (build)                                     0.14 seconds
  @hcengineering/love-resources (build)                           0.02 seconds
  @hcengineering/gmail (build)                                    0.03 seconds
  @hcengineering/gmail-resources (build)                          0.02 seconds
  @hcengineering/model-tracker (build)                            0.18 seconds
  @hcengineering/time (build)                                     0.05 seconds
  @hcengineering/tracker (build)                                  0.08 seconds
  @hcengineering/tracker-resources (build)                        0.02 seconds
  @hcengineering/recruit (build)                                  0.04 seconds
  @hcengineering/recruit-resources (build)                        0.03 seconds
  @hcengineering/rekoni (build)                                   0.04 seconds
  @hcengineering/model-lead (build)                               0.06 seconds
  @hcengineering/lead (build)                                     0.04 seconds
  @hcengineering/lead-resources (build)                           0.03 seconds
  @hcengineering/model-telegram (build)                           0.04 seconds
  @hcengineering/telegram (build)                                 0.04 seconds
  @hcengineering/telegram-resources (build)                       0.05 seconds
  @hcengineering/model-server-core (build)                        0.04 seconds
  @hcengineering/model-server-attachment (build)                  0.04 seconds
  @hcengineering/server-attachment (build)                        0.04 seconds
  @hcengineering/model-server-collaboration (build)               0.05 seconds
  @hcengineering/server-collaboration (build)                     0.06 seconds
  @hcengineering/model-server-contact (build)                     0.04 seconds
  @hcengineering/server-contact (build)                           0.04 seconds
  @hcengineering/server-notification (build)                      0.02 seconds
  @hcengineering/server-templates (build)                         0.04 seconds
  @hcengineering/model-server-notification (build)                0.04 seconds
  @hcengineering/model-server-setting (build)                     0.03 seconds
  @hcengineering/server-setting (build)                           0.03 seconds
  @hcengineering/model-server-chunter (build)                     0.03 seconds
  @hcengineering/server-chunter (build)                           0.04 seconds
  @hcengineering/model-server-task (build)                        0.04 seconds
  @hcengineering/server-task (build)                              0.04 seconds
  @hcengineering/model-server-tracker (build)                     0.03 seconds
  @hcengineering/server-tracker (build)                           0.06 seconds
  @hcengineering/server-view (build)                              0.02 seconds
  @hcengineering/model-server-tags (build)                        0.04 seconds
  @hcengineering/server-tags (build)                              0.06 seconds
  @hcengineering/model-server-recruit (build)                     0.03 seconds
  @hcengineering/server-recruit (build)                           0.05 seconds
  @hcengineering/model-server-lead (build)                        0.05 seconds
  @hcengineering/server-lead (build)                              0.11 seconds
  @hcengineering/model-server-inventory (build)                   0.05 seconds
  @hcengineering/server-inventory (build)                         0.13 seconds
  @hcengineering/inventory (build)                                0.03 seconds
  @hcengineering/model-server-templates (build)                   0.05 seconds
  @hcengineering/model-templates (build)                          0.16 seconds
  @hcengineering/templates-resources (build)                      0.02 seconds
  @hcengineering/model-text-editor (build)                        0.03 seconds
  @hcengineering/model-inventory (build)                          0.06 seconds
  @hcengineering/inventory-resources (build)                      0.15 seconds
  @hcengineering/model-server-calendar (build)                    0.04 seconds
  @hcengineering/server-calendar (build)                          0.07 seconds
  @hcengineering/model-server-gmail (build)                       0.04 seconds
  @hcengineering/server-gmail (build)                             0.05 seconds
  @hcengineering/model-server-telegram (build)                    0.03 seconds
  @hcengineering/server-telegram (build)                          0.05 seconds
  @hcengineering/model-board (build)                              0.04 seconds
  @hcengineering/board (build)                                    0.03 seconds
  @hcengineering/board-resources (build)                          0.05 seconds
  @hcengineering/model-hr (build)                                 0.04 seconds
  @hcengineering/hr (build)                                       0.02 seconds
  @hcengineering/hr-resources (build)                             0.04 seconds
  @hcengineering/model-server-hr (build)                          0.04 seconds
  @hcengineering/server-hr (build)                                0.04 seconds
  @hcengineering/model-bitrix (build)                             0.04 seconds
  @hcengineering/bitrix (build)                                   0.04 seconds
  @hcengineering/bitrix-resources (build)                         0.05 seconds
  @hcengineering/model-request (build)                            0.03 seconds
  @hcengineering/request-resources (build)                        0.03 seconds
  @hcengineering/model-server-request (build)                     0.05 seconds
  @hcengineering/server-request (build)                           0.06 seconds
  @hcengineering/model-server-view (build)                        0.03 seconds
  @hcengineering/model-server-activity (build)                    0.04 seconds
  @hcengineering/server-activity (build)                          0.03 seconds
  @hcengineering/server-activity-resources (build)                0.09 seconds
  @hcengineering/server-notification-resources (build)            0.03 seconds
  @hcengineering/collaboration (build)                            0.06 seconds
  @hcengineering/model-server-openai (build)                      0.04 seconds
  @hcengineering/openai (build)                                   0.16 seconds
  @hcengineering/model-server-translate (build)                   0.04 seconds
  @hcengineering/translate (build)                                0.09 seconds
  @hcengineering/model-support (build)                            0.04 seconds
  @hcengineering/model-server-guest (build)                       0.04 seconds
  @hcengineering/server-guest (build)                             0.08 seconds
  @hcengineering/model-document (build)                           0.09 seconds
  @hcengineering/document (build)                                 0.04 seconds
  @hcengineering/document-resources (build)                       0.02 seconds
  @hcengineering/model-server-document (build)                    0.05 seconds
  @hcengineering/server-document (build)                          0.09 seconds
  @hcengineering/model-time (build)                               0.05 seconds
  @hcengineering/time-resources (build)                           0.08 seconds
  @hcengineering/model-server-time (build)                        0.04 seconds
  @hcengineering/server-time (build)                              0.09 seconds
  @hcengineering/model-drive (build)                              0.05 seconds
  @hcengineering/model-print (build)                              0.04 seconds
  @hcengineering/print-resources (build)                          0.03 seconds
  @hcengineering/print (build)                                    0.03 seconds
  @hcengineering/sign (build)                                     0.03 seconds
  @hcengineering/drive-resources (build)                          0.08 seconds
  @hcengineering/model-server-drive (build)                       0.05 seconds
  @hcengineering/server-drive (build)                             0.04 seconds
  @hcengineering/model-server-love (build)                        0.08 seconds
  @hcengineering/server-love (build)                              0.04 seconds
  @hcengineering/model-questions (build)                          0.05 seconds
  @hcengineering/questions (build)                                0.16 seconds
  @hcengineering/questions-resources (build)                      0.02 seconds
  @hcengineering/model-training (build)                           0.05 seconds
  @hcengineering/training (build)                                 0.10 seconds
  @hcengineering/training-resources (build)                       0.02 seconds
  @hcengineering/controlled-documents (build)                     0.03 seconds
  @hcengineering/model-controlled-documents (build)               0.05 seconds
  @hcengineering/controlled-documents-resources (build)           0.03 seconds
  @hcengineering/model-products (build)                           0.08 seconds
  @hcengineering/products (build)                                 0.05 seconds
  @hcengineering/products-resources (build)                       0.02 seconds
  @hcengineering/model-server-products (build)                    0.07 seconds
  @hcengineering/model-server-training (build)                    0.06 seconds
  @hcengineering/server-training (build)                          0.04 seconds
  @hcengineering/model-server-controlled-documents (build)        0.02 seconds
  @hcengineering/server-controlled-documents (build)              0.06 seconds
  @hcengineering/account-service (build)                          0.04 seconds
  @hcengineering/auth-providers (build)                           0.07 seconds
  @hcengineering/activity-assets (build)                          0.07 seconds
  @hcengineering/apm (build)                                      0.05 seconds
  @hcengineering/attachment-assets (build)                        0.03 seconds
  @hcengineering/backup-service (build)                           0.06 seconds
  @hcengineering/bitrix-assets (build)                            0.07 seconds
  @hcengineering/board-assets (build)                             0.04 seconds
  @hcengineering/calendar-assets (build)                          0.04 seconds
  @hcengineering/chunter-assets (build)                           0.03 seconds
  @hcengineering/collaborator (build)                             0.19 seconds
  @hcengineering/contact-assets (build)                           0.05 seconds
  @hcengineering/controlled-documents-assets (build)              0.06 seconds
  @hcengineering/devmodel (build)                                 0.04 seconds
  @hcengineering/devmodel-resources (build)                       0.04 seconds
  @hcengineering/document-assets (build)                          0.06 seconds
  @hcengineering/drive-assets (build)                             0.06 seconds
  @hcengineering/front (build)                                    0.05 seconds
  @hcengineering/gmail-assets (build)                             0.06 seconds
  @hcengineering/guest-assets (build)                             0.05 seconds
  @hcengineering/hr-assets (build)                                0.04 seconds
  @hcengineering/image-cropper-resources (build)                  0.01 seconds
  @hcengineering/inventory-assets (build)                         0.05 seconds
  @hcengineering/lead-assets (build)                              0.04 seconds
  @hcengineering/login-assets (build)                             0.04 seconds
  @hcengineering/login-resources (build)                          0.03 seconds
  @hcengineering/love-assets (build)                              0.04 seconds
  @hcengineering/notification-assets (build)                      0.04 seconds
  @hcengineering/pod-account (build)                              0.05 seconds
  @hcengineering/pod-backup (build)                               0.02 seconds
  @hcengineering/server-pipeline (build)                          0.06 seconds
  @hcengineering/server-attachment-resources (build)              0.04 seconds
  @hcengineering/server-collaboration-resources (build)           0.04 seconds
  @hcengineering/server-contact-resources (build)                 0.06 seconds
  @hcengineering/server-setting-resources (build)                 0.03 seconds
  @hcengineering/server-chunter-resources (build)                 0.04 seconds
  @hcengineering/server-inventory-resources (build)               0.03 seconds
  @hcengineering/server-lead-resources (build)                    0.03 seconds
  @hcengineering/server-task-resources (build)                    0.03 seconds
  @hcengineering/server-recruit-resources (build)                 0.06 seconds
  @hcengineering/server-tracker-resources (build)                 0.06 seconds
  @hcengineering/server-tags-resources (build)                    0.07 seconds
  @hcengineering/server-calendar-resources (build)                0.07 seconds
  @hcengineering/server-gmail-resources (build)                   0.03 seconds
  @hcengineering/server-telegram-resources (build)                0.03 seconds
  @hcengineering/server-time-resources (build)                    0.04 seconds
  @hcengineering/server-hr-resources (build)                      0.04 seconds
  @hcengineering/server-request-resources (build)                 0.04 seconds
  @hcengineering/server-view-resources (build)                    0.05 seconds
  @hcengineering/server-document-resources (build)                0.04 seconds
  @hcengineering/server-guest-resources (build)                   0.04 seconds
  @hcengineering/server-controlled-documents-resources (build)    0.02 seconds
  @hcengineering/server-training-resources (build)                0.05 seconds
  @hcengineering/view-assets (build)                              0.11 seconds
  @hcengineering/task-assets (build)                              0.12 seconds
  @hcengineering/recruit-assets (build)                           0.12 seconds
  @hcengineering/setting-assets (build)                           0.12 seconds
  @hcengineering/support-assets (build)                           0.03 seconds
  @hcengineering/telegram-assets (build)                          0.08 seconds
  @hcengineering/workbench-assets (build)                         0.08 seconds
  @hcengineering/templates-assets (build)                         0.07 seconds
  @hcengineering/preference-assets (build)                        0.07 seconds
  @hcengineering/tags-assets (build)                              0.07 seconds
  @hcengineering/tracker-assets (build)                           0.08 seconds
  @hcengineering/request-assets (build)                           0.08 seconds
  @hcengineering/products-assets (build)                          0.08 seconds
  @hcengineering/training-assets (build)                          0.09 seconds
  @hcengineering/server-drive-resources (build)                   0.08 seconds
  @hcengineering/server-love-resources (build)                    0.09 seconds
  @hcengineering/pod-collaborator (build)                         0.10 seconds
  @hcengineering/pod-front (build)                                0.11 seconds
  @hcengineering/time-assets (build)                              0.08 seconds
  @hcengineering/text-editor-assets (build)                       0.04 seconds
  @hcengineering/print-assets (build)                             0.08 seconds
  @hcengineering/questions-assets (build)                         0.09 seconds
  @hcengineering/pod-server (build)                               0.17 seconds
  @hcengineering/tests-sanity (build)                             0.86 seconds
  @hcengineering/tool (build)                                     0.16 seconds

==[ SUCCESS: 10 operations ]===================================================

These operations completed successfully:
  @hcengineering/apm (bundle)                 2.06 seconds
  @hcengineering/collaborator (bundle)        9.78 seconds
  @hcengineering/pod-account (bundle)         3.59 seconds
  @hcengineering/pod-backup (bundle)          7.70 seconds
  @hcengineering/pod-collaborator (bundle)    2.85 seconds
  @hcengineering/pod-front (bundle)           2.97 seconds
  @hcengineering/pod-server (bundle)          10.28 seconds
  @hcengineering/tool (bundle)                9.28 seconds
  @hcengineering/pod-front (package)          4.75 seconds