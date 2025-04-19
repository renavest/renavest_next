# Cursor Rule: PR and Commit Best Practices

## Purpose
Ensure all pull requests and commits follow a clear, consistent, and industry-standard structure inspired by top open source practices and xKevIsDev's PR style.

## Pull Request Guidelines
- **Title**: Short, descriptive, and clear.
- **Summary**: One or two sentences summarizing the PR's purpose and impact.
- **Changelog**: Categorize changes using clear sections:
  - ✨ Features
  - 💎 UI Enhancements
  - ♻️ Code Refactoring & Tidy Up
  - 🐛 Bug Fixes
  - 📚 Documentation
- **Description**: Detailed explanation of the changes, motivation, and context. Link related issues.
- **Testing**: Describe what was tested and how reviewers can verify changes.
- **Impact**: Note performance, dependencies, or breaking changes.
- **Checklist**: Ensure code style, documentation, and semantic commit messages.
- **Commit Summary**: List key commits with type, scope, and summary.
- **Reviewers**: Tag relevant reviewers.
- **Related Issues/PRs**: Link related issues or PRs.

## Commit Message Guidelines
- Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `<type>(<scope>): <subject>`
  - Types: feat, fix, docs, style, refactor, test, chore, build, ci, perf, revert
  - Scope is optional but recommended for clarity
  - Subject line: imperative mood, max 50 characters, no period
  - Separate subject from body with a blank line
  - Body: explain what and why, not how; wrap at 72 characters
  - Footer: references to issues, breaking changes, co-authors
- Example:
  - `feat(chat): add rewind/fork functionality`
  - `fix(ui): resolve dropdown menu alignment`
  - `docs(readme): update installation instructions`

## PR Automation
- When pushing and opening a PR, always:
  - Run the build and ensure it passes
  - Use the PR template structure above
  - Summarize key commits in the PR
  - Tag reviewers
  - Reference related issues/PRs

## References
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)
- [Git Commit Message Best Practices](https://axolo.co/blog/p/git-commit-messages-best-practices-examples) 