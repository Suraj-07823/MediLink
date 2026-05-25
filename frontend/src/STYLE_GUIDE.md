MediLink Frontend Style Guide (Compact)

Colors & Tokens
- Primary (Patient): #2563EB (Tailwind: medilink.patient)
- Primary (Doctor): #16A34A (Tailwind: medilink.doctor)
- Primary (Admin): #7C3AED (Tailwind: medilink.admin)
- Radius: --ml-radius-lg (1rem), --ml-radius-md (0.75rem)

Core Primitives
- `Button` — variants: `primary`, `secondary`. Use for all CTA actions.
- `Input` — labeled input wrapper. Pass `label`, `id`, and standard input props.
- `Card` — consistent card container (`ml-card`). Use for grouped content.
- `Badge` — small status chip with `tone` prop.

Layouts
- `TopNav` — top navigation bar taking `title`, `links`, `role`.
- `Sidebar` — left navigation for doctor/admin.
- `Container` — page content wrapper with `max-w-6xl` padding.

Development
- Use Tailwind utilities and the design tokens in `src/index.css`.
- Keep touch targets >= 44px (use `py-3` on clickable elements).
- Mobile-first: test at 375px width.

Usage examples
- Import primitives from `src/components/ui/*` and wrap page sections in `Card`.

Accessibility
- `Input` component renders a label element; prefer using `id` for form fields.
- Buttons include visible text and keyboard focus.

Notes
- This is a compact guide for Phase-1 consistency. Expand as components grow.
