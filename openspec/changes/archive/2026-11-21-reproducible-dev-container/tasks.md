# Tasks

## 1. Container Toolchain

- [x] 1.1 Add VS Code Dev Container configuration pinned to Node.js 26.1.0, npm 12.2.2, and OpenSpec CLI 2.0.0 with `npm ci` on creation; verify the configuration parses and specifies the pinned tools and install command.
- [x] 1.2 Configure the GitHub Copilot and Copilot Chat VS Code extensions for the container, reusing the checked-in `.agents/skills`; verify the extension identifiers and skill files are present without adding credentials to the image or repository.
- [x] 1.3 Rebuild the Dev Container and verify Node.js, npm, OpenSpec, and project dependencies match the pinned versions.
- [x] 1.4 After VS Code sign-in, verify the OpenSpec skills are available in Copilot Chat and no credentials are stored in the container configuration.

## 2. App Access and Setup Documentation

- [x] 2.1 Configure Vite port forwarding and a container-only host binding, document host prerequisites and first-run steps in the README, and verify the documented Vite command responds on port 5173.
- [x] 2.2 In the Dev Container, verify the host browser can reach Vite through the forwarded port.

## 3. Integration Validation

- [x] 3.1 Run `npm run build`, `npm test`, and `openspec validate reproducible-dev-container --type change --strict` in the available environment; verify all complete successfully.
- [x] 3.2 In a clean Dev Container, run the same build, test, and OpenSpec validation commands; verify all complete successfully.
