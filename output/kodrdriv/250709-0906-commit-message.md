Removed Kodrdriv automation configuration and scripts to decouple CI/CD workflow from repository

- Deleted .kodrdriv/config.yaml, .kodrdriv/context/content.md, commit.sh, and release.sh to eliminate project-specific Kodrdriv automation and release workflow from version control.
- Updated .npmignore to exclude the .kodrdriv directory, source files, Markdown docs, project scripts, and Vitest setup files from published npm packages.
- Pruned package.json to reflect updated dependency and devDependency versions, removing workspace and automation metadata related to previous release flows.

This change simplifies project maintenance by removing embedded automation and ensures the npm package no longer contains internal scripts or configuration files irrelevant for consumers.