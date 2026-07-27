# Helping Tribe Design System

## Foundations

Tokens live in `app/globals.css`; Tailwind font aliases live in `tailwind.config.ts`. Components should consume semantic variables rather than hard-coded brand hex values.

| Purpose | Token / utility | Light intent | Dark intent |
|---|---|---|---|
| Canvas | `--background`, `--canvas` | warm off-white | deep ink |
| Raised surface | `--card`, `--surface-raised` | white/parchment | navy-ink |
| Primary text | `--foreground`, `--text-strong` | ink | warm white |
| Muted text | `--muted-foreground` | slate | mist |
| Brand | `--primary`, `--brand` | clinical teal | luminous teal |
| Border | `--border` | cool grey | softened navy |
| Focus | `--ring` | teal | pale teal |

Typography uses Newsreader for display moments and DM Sans for interface copy. Do not use the display face for controls, metadata, long forms or dense tables.

## Layout and spacing

- `.section-shell`: centred content with fluid gutters and a 76rem maximum.
- `.public-shell`: full application canvas and text colour.
- `--section-space`: fluid vertical section rhythm.
- Prefer `gap` and grid/flex layout over absolute offsets.
- Cards use `rounded-xl`; prominent editorial panels may use `rounded-3xl`.

## Components

- Buttons: at least 44 px tall, wrapping labels, visible focus ring, explicit disabled state.
- Inputs: semantic surface/border colours, 44 px minimum height, associated label and inline error.
- Dialogs/sheets: Radix focus management, Escape close, overlay, viewport cap and internal scrolling.
- Navigation: stable destinations for anonymous visitors; grouped role navigation after authentication.
- Feedback: pair icon, heading and recovery action; never communicate state by colour alone.

## Motion

Motion is limited to short opacity/transform transitions and the slow Orbit of Care composition. `prefers-reduced-motion: reduce` disables continuous animation and shortens all transitions. See `MOTION-SYSTEM.md` for the implementation contract.

## Content voice

Calm, direct and specific. Prefer “learner”, “mentor/facilitator”, “programme”, “counselling” and “organisation”. Avoid urgency, guarantees, invented social proof and unexplained technical language.
