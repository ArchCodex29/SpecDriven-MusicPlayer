# Spec Delta

## Purpose

Provides a consistent, repeatable environment for developing and validating the music player with VS Code, while supporting the project's OpenSpec workflow through Copilot Chat.

## ADDED Requirements

### Requirement: Provide a reproducible project toolchain
The project SHALL provide a VS Code Dev Container with consistent Node.js, npm, OpenSpec CLI, and project dependencies so contributors can run the documented development and validation commands on supported Dev Container hosts.

#### Scenario: Initialize the development environment
- **WHEN** a contributor opens the project in its Dev Container for the first time
- **THEN** the container provides Node.js 26.1.0, npm 12.2.2, OpenSpec CLI 2.0.0, and the dependencies installed from the project lockfile

#### Scenario: Run project validation
- **WHEN** a contributor runs the documented build and test commands in the container
- **THEN** the commands complete using the container-provided toolchain and project dependencies

### Requirement: Reach the development server from the host
The development environment SHALL make the Vite development server accessible to the contributor's host browser when started in the container.

#### Scenario: Open the running app
- **WHEN** a contributor starts the development server in the container
- **THEN** the development server is available through the forwarded development port in a host browser

### Requirement: Use OpenSpec skills with Copilot Chat
The development environment SHALL support the repository's OpenSpec skills in VS Code Copilot Chat and make the matching OpenSpec CLI available in the integrated terminal.

#### Scenario: Start an OpenSpec workflow
- **WHEN** a contributor invokes a repository OpenSpec skill from Copilot Chat
- **THEN** the skill can invoke the container's OpenSpec CLI against the project

### Requirement: Keep Copilot credentials out of the container
The development environment SHALL NOT bake, persist, or require Copilot credentials in its image or project configuration; contributors authenticate through VS Code.

#### Scenario: Authenticate Copilot
- **WHEN** a contributor uses Copilot Chat in the Dev Container
- **THEN** VS Code uses the contributor's account authentication without credentials being stored in the container configuration
