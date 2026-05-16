# AI Assistant Guidelines (AGENTS.md)

This document provides mandatory instructions for AI coding assistants working on this repository.

## 🛠 Core Technical Requirements

1.  **Format Flow**: Always run `npx prettier --write .` before finishing a task.
2.  **Configuration**: **ALWAYS** use the local `.prettierrc` file for formatting. Do not use global or default prettier settings.
3.  **Code Style**: Strictly follow the rules in [UNIVERSAL-CODE-STYLE-RULES.md](../UNIVERSAL-CODE-STYLE-RULES.md).
    *   **Early Returns**: Use guard clauses to flatten logic.
    *   **Else-less**: Avoid `else` blocks whenever possible.
    *   **Explicit Braces**: Never omit braces in control structures.
4.  **Backend Safety**: When modifying routes, ensure environment variables (like `GITHUB_TOKEN`) are correctly handled and errors are logged but not exposed to the client.

## 🎨 UI & Design Rules

1.  **Design System**: All UI changes must adhere to the [Design System](design.md) and use tokens from [design.json](design.json).
2.  **Consistency**: Use the standardized `.btn` classes in `app/assets/css/main.css`. Avoid ad-hoc styling with inline Tailwind classes for common components.
3.  **Icons**: Use **Iconify** for all icons. Follow the pattern `<collection>:<icon-name>`.
4.  **Responsive**: Ensure all components work well on varying screen sizes and respect "TV Mode" (hiding navigation).

## 🚀 Workflow

1.  **Understand**: Read existing components before proposing changes.
2.  **Plan**: Propose changes using an implementation plan for non-trivial tasks.
3.  **Execute**: Implement changes ensuring clean, readable code.
4.  **Verify**: Validate changes visually (via browser tools) and functionally (via build).
5.  **Clean**: Format code using the project's Prettier config before committing.
6.  **Document**: Update `README.md` or design files if new features or patterns are introduced.
