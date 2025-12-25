## Packages
canvas-confetti | For celebration effects when completing a list
framer-motion | For smooth animations and transitions
clsx | For conditional class merging (utility)
tailwind-merge | For merging tailwind classes (utility)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Local Storage is used for persistence.
Backend APIs /api/parse/excel and /api/parse/github are used for converting files to JSON.
