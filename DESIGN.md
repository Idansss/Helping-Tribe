# Helping Tribe Academy Design System

## Product posture

Helping Tribe Academy is a calm, high-trust learning environment for counselling and positive psychology. The interface should feel grounded, humane, contemporary, and quietly premium. It must never feel clinical, gamified, or visually noisy.

## Memorable idea

Care is a practice: knowledge, reflection, application, and connection form one continuous learning loop.

## Visual direction

- Editorial typography paired with precise product UI.
- Warm off-white canvases alternate with deep navy immersion sections.
- Teal is the primary action and guidance colour. Plum adds reflective depth. Muted gold marks milestones and completion.
- Depth is created with layering, light, translucency, and restrained perspective. Do not apply shadows or rounded cards to every surface.

## Typography

- Display: Newsreader, optical serif, weights 400-600.
- Body and UI: DM Sans, weights 400-700.
- Display tracking: -0.035em to -0.045em at large sizes.
- Body copy: 16-18px with 1.65-1.75 line height on marketing pages.
- Eyebrows: 12px, weight 700, 0.16em tracking, uppercase.

## Colour

- Canvas: `#faf8f4`
- Surface: `#ffffff`
- Surface muted: `#eef7f4`
- Deep navy: `#0b1320`
- Primary teal: `#0d5e57`
- Soft teal: `#68c4b8`
- Reflective plum: `#5b2a86`
- Milestone gold: `#c6a365`
- Primary ink: `#0b1320`
- Secondary ink: `#334155`
- Tertiary ink: `#64748b`

Dark mode uses `#101924` as canvas, `#17222f` as surface, `#68c4b8` as primary, `#c5a7e6` as plum, and `#d8bd7a` as gold.

## Layout and spacing

- Base unit: 4px.
- Section spacing: `clamp(4rem, 9vw, 7.5rem)`.
- Page gutter: `clamp(1rem, 3vw, 2rem)`.
- Maximum marketing width: 1280px.
- Use asymmetric 5/7 or 4/8 editorial grids before equal columns.
- Radius scale: 8px controls, 16px panels, 24-48px immersive surfaces, full pills only for compact actions and status.

## Motion

Motion explains hierarchy, preserves spatial continuity, confirms interaction, or prevents a state change from feeling abrupt. If it does none of those things, remove it.

- Fast feedback: 120-160ms.
- Standard UI change: 180-220ms.
- Panel transition: 240-300ms.
- Page or large reveal: 360-700ms.
- Enter/exit easing: `cubic-bezier(.16, 1, .3, 1)`.
- Movement/morph easing: `cubic-bezier(.65, 0, .35, 1)`.
- Use CSS transforms and opacity for predetermined animation.
- Use springs only for pointer, drag, or other interruptible interactions.
- Never stagger more than five items. Keep stagger gaps between 40ms and 80ms.
- Never animate high-frequency navigation in a way that delays the user.
- `prefers-reduced-motion: reduce` must remove continuous motion, perspective tracking, and transition travel while keeping every state legible.

## Depth and 3D

- Perspective is reserved for the learning-loop hero and occasional product demonstrations.
- Maximum pointer tilt: 7 degrees on X, 9 degrees on Y.
- Separate foreground, content, and atmosphere with modest `translateZ` values rather than extreme rotation.
- Lighting follows the pointer only on fine-pointer devices.
- Do not use WebGL for decorative scenes that CSS can render more efficiently.

## Interaction details

- Buttons visibly depress on press by no more than 2%.
- Hover lift is capped at 5px and only used for genuinely interactive panels.
- Focus rings remain visible and use the semantic ring token.
- Touch targets are at least 44px.
- Cards are not clickable unless the whole card has an obvious destination or action.

## References

- Existing Helping Tribe identity and live product.
- Emil Kowalski's design-engineering guidance: purposeful motion, fast ease-out entrances, CSS for predictable animation, and springs for interruptible interaction.

## Decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-07-28 | Preserve teal, plum, gold, navy, and warm canvas | Retains brand recognition while improving contrast and system consistency. |
| 2026-07-28 | Use editorial/product hybrid layout | The school needs warmth and authority without feeling like a generic education template. |
| 2026-07-28 | Add reveal choreography and pointer-responsive hero depth | Extends polish beyond the hero while keeping motion purposeful and accessible. |
