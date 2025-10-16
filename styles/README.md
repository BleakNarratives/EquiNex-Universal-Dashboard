# /styles

This directory contains the aesthetic core of the EquiNex Universal Dashboard. It manages the dynamic, persona-based theming system.

## File Overview

-   **`themes.ts`**: This is the central file for all UI theming.
    -   **Theme Definitions**: It exports multiple `Theme` objects (e.g., `aetherial`, `goliath`). Each theme is a collection of CSS custom properties (variables) that define the entire color palette, fonts, and other stylistic elements for the application.
    -   **Persona-Theme Mapping**: It contains the `personaThemes` object, which creates a direct link between a selected AI `Persona` (e.g., 'Operator') and a `Theme` name (e.g., 'velocity'). This mapping is used by the `AppContext` to automatically switch the entire UI's look and feel when the user changes the active persona.
