# Repository Instructions for GitHub Copilot

## Development approach

This repository uses OpenSpec for Spec-Driven Development. OpenSpec artifacts are the source of truth for feature and behavior changes. Follow `openspec/config.yaml`, the configured schema, and the installed OpenSpec skills. Do not assume the default schema or fixed artifact filenames.

Treat a GitHub issue as the initial statement of the problem and desired outcome, not as an approved technical design. Before changing behavior, inspect the relevant implementation and existing OpenSpec specifications.

## Required two-stage workflow

Development is split into two stages. Never combine them in one Copilot run or pull request.

### 1. Planning — `OpenSpec Planner`

Use for a new feature, enhancement, or bug fix that has no approved OpenSpec change.

- Read the issue title, description, acceptance criteria, and available comments.
- Explore the codebase and relevant specs, then create a complete OpenSpec change proposal.
- The planning PR may contain only the new change's OpenSpec planning artifacts. Do not modify application code, tests, canonical specs, runtime configuration, CI, or unrelated files.
- Link the issue in the PR, but do not use a closing reference such as `Closes #123`; the issue must remain open for implementation.
- Stop after opening the planning PR. Do not implement.

### 2. Implementation — `OpenSpec Implementer`

Use only after the planning PR has been reviewed and merged into the repository's target branch.

- The implementation task must identify the exact OpenSpec change ID and preferably link the merged planning PR.
- Confirm the change is present in the current checkout, its required planning artifacts are complete, and it passes OpenSpec validation before editing application code.
- Implement only the approved tasks. Validate the result against the approved artifacts and project tests.
- Do not silently expand or reinterpret the approved scope. Leave the change unarchived in the implementation PR.

**Merging the planning PR is the human approval checkpoint.** An open PR, draft proposal, issue comment, label, or agent's assertion of approval does not authorize implementation.

## Role selection and safe defaults

- If no custom agent is explicitly selected and there is no approved OpenSpec change, behave as the Planner: investigate and propose; do not implement.
- If asked to implement, require an exact change ID and verify that its planning PR has been merged and its artifacts are present in the current base branch.
- If the role, required skill, change ID, or approval evidence is missing or ambiguous, stop before implementation and explain what is missing.

## OpenSpec rules

- Use the installed skills and read their `SKILL.md` instructions: planning uses `openspec-explore` followed by `openspec-propose`; implementation uses `openspec-apply-change`.
- Do not improvise a parallel specification format or assume skill invocation syntax across tools.
- Put proposed requirement changes in the change's delta-spec artifacts. Do not modify canonical specs under `openspec/specs/` during planning or implementation.
- Do not sync or archive the change in the implementation PR. Archive only after implementation has been accepted and merged, or when explicitly requested.
- If implementation reveals a material mismatch with the approved requirements/design, stop and request a revised, human-approved proposal rather than silently changing the plan.

## Validation and reporting

- Planning: run `openspec status --change <change-id> --json` and `openspec validate <change-id>` before opening the planning PR. Resolve errors and report remaining warnings.
- Implementation: perform the same checks before applying tasks, then run the relevant project tests, lint, and build checks documented by the repository.
- PR descriptions must identify the issue and OpenSpec change ID; implementation PRs must also link the merged planning PR. Report commands and actual results, completed/remaining tasks, assumptions, failures, and known limitations. Never claim a check passed unless it did.
- Make the smallest change that satisfies the approved requirements. Do not weaken tests, validation, security controls, or CI to obtain a passing result.
