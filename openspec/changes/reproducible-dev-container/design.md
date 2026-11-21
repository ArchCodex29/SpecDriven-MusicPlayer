# Design

## Context

The project is a Vite/TypeScript browser application with `npm run dev`, `npm run build`, and `npm test` scripts and a committed `package-lock.json`. The repository already contains OpenSpec skills under `.agents/skills` targeted at GitHub Copilot. It has no Dev Container configuration, and `package.json` does not declare a Node.js version.

## Goals / Non-Goals

**Goals:**
- Make the same project toolchain available from VS Code on Windows, macOS, and Linux hosts with Docker and the Dev Containers extension.
- Keep project dependencies and OpenSpec CLI usable from the container's integrated terminal.
- Make the app accessible from the host browser and enable the repository's existing skills in Copilot Chat.
- Keep Copilot authentication out of container images and repository settings.

**Non-Goals:**
- Install or configure standalone Copilot CLI.
- Run the music app's production server, a Subsonic server, or a browser inside the container.
- Provision Docker, VS Code, a Copilot subscription, or GitHub credentials on the host.

## Decisions

1. **Use a VS Code Dev Container based on a Node.js 26.1.0 image.** Explicitly provide npm 12.2.2 and `@fission-ai/openspec` 2.0.0 to match the currently observed WSL toolchain. Pin tool versions rather than relying on whichever version happens to be latest. Use the committed lockfile with `npm ci` for project dependencies. An official Node.js image or Dev Container Node feature is preferable to maintaining a custom base OS.

2. **Install project dependencies at container creation.** Run `npm ci` as the post-create setup so the lockfile remains the source of truth and the existing app commands work immediately after setup. Do not copy `node_modules` from the host.

3. **Configure Copilot extensions in the Dev Container, reuse repository skills.** Recommend/install the VS Code GitHub Copilot and Copilot Chat extensions through Dev Container customizations. Keep the existing `.agents/skills` files in the repository; do not download another copy. This matches the established chat workflow without adding Copilot CLI.

4. **Keep authentication in VS Code.** Do not pass tokens through build arguments, environment variables, or committed settings. The contributor signs in through VS Code; extension availability does not imply a Copilot entitlement or successful sign-in.

5. **Forward only the Vite development port.** Forward port 5173 and run Vite with a container-specific `--host 0.0.0.0` option so the host browser can reach it. Document this container command rather than changing the default local development command to listen on every interface.

6. **Document host prerequisites and first-run steps.** The README should state that VS Code, Docker, and the Dev Containers extension are required on the host, then describe opening/rebuilding the container, running validation, starting Vite, and signing into Copilot.

## Risks / Trade-offs

- [Pinned tool versions eventually need security and compatibility updates] → Keep versions explicit and update them intentionally with the project toolchain, then run build, tests, and OpenSpec validation.
- [Copilot sign-in or entitlement may differ by host/account] → Keep auth outside the container and document that contributors must sign in and have Copilot access in VS Code.
- [Vite's container-only host binding exposes the server on the container network] → Use it only for the documented Dev Container command and forward the development port, not arbitrary services.
- [First creation requires network access to package registries] → Use `npm ci` and explicit CLI versions; report setup failures rather than silently continuing.

## Migration Plan

No application data or user state needs migration. Contributors can continue using their existing local setup; they may opt into the Dev Container by reopening the repository in it. If the container configuration proves unsuitable, remove the Dev Container files and their README instructions; the existing local npm workflow remains available.
