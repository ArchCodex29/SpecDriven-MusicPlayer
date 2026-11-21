# Proposal

## Why

The project currently depends on manually installed tools in one WSL instance, making it harder to reproduce the development workflow on another machine. A checked-in VS Code Dev Container should provide a consistent Node.js, npm, OpenSpec, and Copilot Chat environment while keeping account authentication outside the container.

## What Changes

- Add a VS Code Dev Container for installing project dependencies and running the existing development, build, and test commands.
- Provision the OpenSpec CLI and recommend the VS Code Copilot extensions needed to use the repository's existing OpenSpec skills in chat.
- Document how to open the container, start the app, and authenticate Copilot without embedding credentials in the container.

## Capabilities

### New Capabilities
- `development-environment`: Reproducible project setup and the supported VS Code Copilot/OpenSpec development workflow.

### Modified Capabilities
- None.

## Impact

Adds Dev Container configuration and setup documentation, plus a new OpenSpec capability. The app's runtime behavior and existing playback, browsing, and server-connection requirements are unchanged. The setup will match the currently observed Node.js 26.1.0, npm 12.2.2, and OpenSpec 2.0.0 versions unless implementation research identifies a compatibility constraint.
