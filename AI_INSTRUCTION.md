# Coconeeds: SYSTEM CONTEXT & UI/UX GUIDELINES

## 1. Core Philosophy & Platform Goal

Coconeeds is a Smart Circular Logistics and Agroindustry Platform.

- **Design Direction:** Inspired by Notion's clean, minimalist aesthetics, but MUST feel like a distinct, branded WebApp. Do not just clone Notion; use it as a baseline for cleanliness, spacing, and readability.
- **Mobile-First & PWA:** This WebApp will be compiled into a Progressive Web App (PWA). All UI layouts must be highly responsive, prioritizing mobile ergonomics (touch targets, fluid typography, readable padding, horizontal scrolling for overflowing tables).

## 2. Global Design Tokens (Strict Rules)

- **Typography:** ONLY use `Quicksand`.
  - Exploit font-weight variations to create a strong visual hierarchy (e.g., use `font-bold` or `font-extrabold` for primary headers, `font-medium` for subheaders/labels, and `font-normal` for body text). Readability is paramount.
- **Backgrounds:**
  - Main Content Canvas: Pure White (`#FFFFFF`).
  - Subtle Accents/Surfaces: Soften the original Cream (`#FEFAE0`) to an even lighter, more transparent hint (e.g., `#FDFDFC` or using low opacity) so it doesn't look dirty. Use for sidebar backgrounds, table headers, or subtle active states.
- **Brand Colors:**
  - Primary Accent: Olive Green (`#606C38`). Use for primary actions, active tabs, main buttons, and key highlights.
  - Secondary Accents: Dark Green (`#283618`), Light Earth (`#DDA15E`), Dark Earth (`#BC6C25`). Use sparingly for badges, status indicators, or data visualization.
- **Borders & Shadows (Performance Focused):**
  - STRICTLY AVOID drop-shadows (`shadow-md`, `shadow-lg`, etc.).
  - Rely entirely on clean, thin borders (e.g., `border border-gray-200` or `border-border`) to separate elements. This guarantees high performance on low-end mobile devices and maintains the flat aesthetic.
- **Border Radius:** Default to standard `rounded-md`. Do not overuse extreme roundness (like `rounded-full` or `rounded-2xl` on large containers), apply appropriately based on context.

## 3. Component Anatomy (Shadcn UI Customization)

- **Data Tables:**
  - Remove all vertical borders to reduce visual clutter.
  - Implement horizontal borders for rows.
  - Enable Zebra-striping (alternating row background colors with a very subtle gray/cream) to distinguish rows easily on mobile screens.
- **Layout & Sections:**
  - You are empowered to choose between a Bento Grid layout or Horizontal Dividers based on the specific page's UX needs. If a Bento Grid fits well, apply it consistently. Prioritize clean separation of data.

## 4. Motion & Transitions (Framer Motion)

- Smooth transitions are highly encouraged to make the app feel premium. You may use Framer Motion for component intro/landing (e.g., fade-in, slight slide-up).
- **CRITICAL TEXT ANIMATION RULE:** Under no circumstances should text layout animations be arranged sequentially, staggered, or character-by-character. Text elements MUST appear simultaneously as a unified block.

## 5. Backend Quarantine & State Management (STRICT ZERO-MODIFICATION ZONE)

The biggest priority during UI/UX refactoring is preserving the existing business logic. You must act as a UI/UX wrapper around the existing core logic.

- **Data Fetching:** Do NOT delete or mock existing `fetch()` calls inside `useEffect` hooks. If the component currently fetches data from an API (e.g., `/api/panen`), you must keep that logic intact and wire your new UI to consume the existing state variables.
- **State Management:** Preserve all React hooks (`useState`, `useEffect`, `useCallback`) and Zustand store integrations (e.g., `useAdminStore`). Do not rename state variables unless absolutely necessary for the new UI, and if you do, ensure the API payload mapping is updated correctly.
- **Mock Data Prohibition:** NEVER replace a working API integration with static mock data unless explicitly instructed by the user for a specific incomplete feature.
- **Component Preservation:** If the original file contains `Dialog`, `Modal`, `Tabs`, or specific form submissions, DO NOT delete them to achieve "minimalism". You must REDESIGN those components using the new design system.

## 6. Code Architecture & Comments

- **Directives:** Always preserve the `"use client"` directive at the top of the file if the component uses client-side hooks.
- **Commenting Style:** Keep code comments natural, brief, and professional (e.g., `// Fetch inventory data`). Do NOT use robotic or AI-specific marker comments like `// --- AI MODIFICATION START ---`.
- **Modularity:** If a page becomes too complex after applying the Bento Grid or detailed Data Tables, abstract the UI into smaller, readable sub-components within the same file.

## 7. Execution Protocol for Antigravity CLI

When assigned a page to refactor, you must follow this internal protocol:

1. **Analyze Existing Logic:** Identify all state variables, API endpoints, and payload structures in the current file.
2. **Map the UI:** Determine how the existing data maps to the new mobile-first, no-shadow, Quicksand-based Notion aesthetic.
3. **Wrap & Refactor:** Build the new UI shell (Data Tables with zebra-striping, minimal borders, etc.) and inject the preserved state variables into it.
4. **Motion Check:** Verify that Framer Motion is used elegantly for container intros, and guarantee NO sequential/staggered text animations exist.
