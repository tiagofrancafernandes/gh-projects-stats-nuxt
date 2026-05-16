# Design System - GitHub Insights

This document outlines the design principles and system for the GitHub Insights dashboard.

## 🎨 Visual Identity

The design system is built on a **Premium Dark** aesthetic, utilizing high contrast between deep blacks and pure whites, with subtle blue accents for interactive elements.

### Principles

1.  **Professional Clarity**: Use smaller, focused UI elements over bulky components.
2.  **Typography-First**: Rely on font weights and spacing (`Inter`) rather than heavy borders or colors.
3.  **Flat but Deep**: Use subtle borders (`zinc-800`) and backdrop blurs to create depth without relying on gradients or shadows.
4.  **Interactive Precision**: Hover states should be snappy and provide clear feedback (color shifts, outlined transitions).

## 🧩 Components

### Buttons (`.btn`)

Standardized button system defined in `app/assets/css/main.css`:

*   **`.btn-black`**: Solid dark background, light text.
*   **`.btn-white`**: Pure white background, dark text (primary action).
*   **`.btn-outline`**: Transparent with border, highlights on hover.
*   **`.btn-ghost`**: No border or background, highlights on hover.

### Cards

*   **Border Radius**: `12px` (`rounded-xl`).
*   **Background**: `zinc-900/40` with `backdrop-blur-md`.
*   **Border**: `zinc-800` (`1px`).

### Navigation

*   **Fixed Top**: The menu should always be accessible at the top of the viewport.
*   **Contextual Hiding**: Navigation must hide in "TV Mode" or fullscreen to maximize data real estate.

## 🛠 Usage in Code

Always refer to `design.json` for token values and use the utility classes defined in `main.css`.
Avoid inline Tailwind classes for repetitive UI patterns.
