# Vercel Web Interface & Design System Guidelines

## 1. Visual Theme & Atmosphere

Vercel's website is the visual thesis of developer infrastructure made invisible — a design system so restrained it borders on philosophical. The page is overwhelmingly white (`#ffffff`) with near-black (`#171717`) text, creating a gallery-like emptiness where every element earns its pixel. This isn't minimalism as decoration; it's minimalism as engineering principle.

The custom **Geist** font family is the crown jewel. Geist Sans uses aggressive negative letter-spacing, creating headlines that feel compressed, urgent, and engineered — like code that's been minified for production.

What distinguishes Vercel from other monochrome design systems is its **shadow-as-border philosophy**. Vercel uses semi-transparent shadows (e.g., `box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.08)`) combined with nested radii. This technique allows borders to exist in the shadow layer, improving edge clarity, enabling smoother transitions, and establishing a subtler visual weight than traditional borders.

**Key Characteristics:**

- **Geist Sans** with extreme negative letter-spacing (-2.4px to -2.88px at display) — text as compressed infrastructure.
- **Shadow-as-border technique**: Replaces traditional borders to maintain crisp edges and multi-layered depth.
- **Optical alignment**: Adjust ±1px when perception beats geometry. No accidental positioning.
- Near-pure white canvas with `#171717` text — creating micro-contrast softness.
- Workflow-specific accent colors: Ship Red (`#ff5b4f`), Preview Pink (`#de1d8d`), Develop Blue (`#0a72ef`).

## 2. Color Palette & Roles

### Primary & Backgrounds

- **Vercel Black** (`#171717`): Primary text, headings, dark surfaces.
- **Pure White** (`#ffffff`): Page background, card surfaces.
- **Browser Theming**: Set `` to match page background. For dark themes, use `color-scheme: dark` on `` to fix scrollbar/input contrasts.

### Workflow & Console Colors

- **Workflow**: Ship Red (`#ff5b4f`), Preview Pink (`#de1d8d`), Develop Blue (`#0a72ef`).
- **Console / Syntax**: Blue (`#0070f3`), Purple (`#7928ca`), Pink (`#eb367f`).

### Interactive & States

- **Focus Blue** (`hsla(212, 100%, 48%, 1)`): Use `:focus-visible` over `:focus` to avoid distracting pointer users.
- **State Contrast**: `:hover`, `:active`, and `:focus` must have visibly more contrast than the rest state. Never rely on color alone for status; include text labels.

## 3. Typography & Copywriting

### Font Families & Features

- **Primary**: `Geist` | **Monospace**: `Geist Mono`
- **Ligatures & Spacing**: `"liga"` enabled globally. Use `"tnum"` (`font-variant-numeric: tabular-nums`) for number columns/comparisons.
- **Text Wrapping**: Use `text-wrap: balance` or `text-pretty` on headings to prevent widows/orphans.

### Copywriting Principles (Vercel-Specific)

- **Active Voice & 2nd Person**: Avoid first person. Say "Install the CLI" instead of "The CLI will be installed."
- **Capitalization**: Title Case for headings & buttons (Chicago style). Sentence case on marketing pages.
- **Numbers & Units**: Use numerals for counts ("8 deployments"). Separate numbers and units with a non-breaking space (`10&nbsp;MB`, `⌘&nbsp;K`).
- **Punctuation**:
  - Use real ellipsis `…` instead of three periods `...`.
  - Prefer curly quotes `“ ”` over straight quotes `" "`.
  - Prefer `&` over `and` where space-constrained.
- **Action-Oriented Ambiguity**: Buttons must be specific. "Save API Key" instead of "Continue".
- **Constructive Errors**: Don't just state the problem; guide the exit (e.g., "Your API key is incorrect. Generate a new key in settings.").

## 4. Components & Interactions

### Forms & Inputs

- **Hit Targets**: Generous targets. Label + control share a single hit target (no dead zones). If visual target is <24px, hit target must expand to ≥24px.
- **Mobile Inputs**: `` font size must be **≥16px** to prevent iOS Safari auto-zoom. Never use `user-scalable=no`.
- **Paste & Typing**: **Never block paste.** Never block keystrokes entirely; allow any input and show validation feedback instead.
- **Placeholders**: Signal emptiness by ending with an ellipsis `…` and show an example pattern (e.g., `sk-012345679…`).
- **Submission**: Keep submit button enabled until submission starts. Once started, disable it, show a spinner, and keep the original label. Add a short show-delay (~150-300ms) to avoid flicker on fast responses.

### Links & Buttons

- **Semantics**: Use `` or `` for navigation. **Never** use `` or `` for routing. Standard browser behavior (Cmd+Click) must work.
- **Buttons**: Use `` exclusively for actions.

### Skeletons & Tooltips

- **Stable Skeletons**: Skeletons must mirror final content exactly to avoid CLS (Cumulative Layout Shift).
- **Tooltip Timing**: Delay the first tooltip in a group; subsequent peers have no delay.

### Drag & Drop

- **Clean Interactions**: Disable text selection and apply `inert` on dragged elements so hover/selection don't trigger simultaneously.

## 5. Depth, Elevation & Borders

- **Nested Radii**: Child border-radius ≤ parent radius, and concentric so curves align mathematically.
- **Layered Shadows**: Mimic ambient + direct light with at least two layers.
- **The Shadow-Border Stack**: Vercel replaces standard borders with a layered box-shadow approach.
  - *Example*: `rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px` (inner highlight + crisp ring + ambient depth).

## 6. Layout & Performance

- **Let Browser Size Things**: Prefer Flex/Grid over JS measurement. Avoid layout reads in render (`getBoundingClientRect`, `offsetHeight`).
- **Safe Areas**: Full-bleed layouts must account for notches using `env(safe-area-inset-*)`.
- **URL as State**: Persist UI state (filters, tabs, expanded panels, pagination) in the URL (`nuqs`) so refresh, sharing, and Back/Forward work perfectly.
- **Scrollbars**: Only render useful scrollbars. Use `overflow-x-hidden` on containers to fix unwanted horizontal scroll. Set `overscroll-behavior: contain` in modals/drawers.
- **Virtualization**: Large lists (>50 items) must be virtualized (`virtua` or `content-visibility: auto`).
- **Preloading**: Preload critical above-fold images (`priority`) and fonts (`rel="preload" as="font" font-display="swap"`).

## 7. Animation & Motion

- **Honor Preferences**: Always check `prefers-reduced-motion` and provide a fallback.
- **Compositor-friendly**: Only animate `transform` and `opacity`. Avoid layout-affecting properties (`width`, `height`, `top`).
- **Never `transition: all`**: Explicitly list properties. `all` causes jank.
- **Interruptible**: Animations must be cancelable and respond to user input mid-animation. Avoid autoplay.
- **SVG Transforms**: Apply CSS transforms to `` wrappers and set `transform-box: fill-box; transform-origin: center;` to avoid Safari bugs.

## 8. Accessibility (A11y)

- **Keyboard Focus**: `focus-visible:ring-*` is mandatory. **Never** use `outline-none` without a visual focus replacement. Group focus with `:focus-within`.
- **ARIA Labeling**: Icon-only buttons must have `aria-label`. Images need `alt` (or `alt=""` if decorative). Decorative icons need `aria-hidden="true"`.
- **Async Updates**: Use `aria-live="polite"` for toasts, loading states, and inline validations.
- **Locale & i18n**: Wrap brand names and code tokens in `translate="no"` to prevent garbled auto-translation. Format dates/numbers using `Intl.DateTimeFormat` / `Intl.NumberFormat`, not hardcoded formats.

## 9. Do's and Don'ts (Anti-patterns to Avoid)

### Do

- Use shadow-as-border instead of CSS borders for cards and inputs.
- Tie interactive elements to URL state (deep-link everything).
- Provide immediate optimistic updates, with graceful rollbacks on failure.
- Ensure destructive actions have confirmation modals or an undo window.
- Add `` to all form controls, or use `aria-label`.

### Don't

- **Don't** use positive letter-spacing on Geist Sans — it runs tight.
- **Don't** use `transition: all` or animate layout properties like `height`/`width`.
- **Don't** block pasting in inputs, or use `preventDefault` on `onPaste`.
- **Don't** disable zoom (`maximum-scale=1` or `user-scalable=no`).
- **Don't** render `` for links or `` for buttons.
- **Don't** use `autoFocus` on mobile (it triggers keyboard and causes layout shifts).

## 10. Agent Prompt Guide (For AI Coding Agents)

When instructing AI (Cursor, Claude, Windsurf) to generate Vercel-styled UI, include this context:

### Quick Tech Stack & Rules

- **Framework**: React / Next.js / Tailwind CSS
- **Typography**: Geist Sans/Mono, `"liga"` enabled, tabular nums for data.
- **Spacing/Layout**: Tailored Flex/Grid, `min-w-0` on flex children for text truncation.
- **State**: URL-driven state over `useState` for UI configuration.

### Example Prompts

- *"Create a hero section. Headline 48px Geist weight 600, tracking-tight (-2.4px), text-wrap: balance. CTA button is native ``, keeps label but shows spinner on submit, enabled until flight. Uses purely shadow-border `box-shadow: 0 0 0 1px rgba(0,0,0,0.08)`."*
- *"Build a form input for an API key. Must have explicit ``, input font-size 16px (mobile safe), autocomplete='off', placeholder ending in '…', allows paste, validates on submit. Focus state uses ring-blue-500, no outline-none."*
- *"Design a 3-column card grid. Cards use multi-layer shadows (ring + 2px ambient + inner white ring). Titles use Title Case. Images have explicit width/height to prevent CLS. Wrap entire card in `` for routing."*
