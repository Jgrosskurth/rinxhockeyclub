Let me check the current state of the weather effects on mobile.# Mobile Weather Effects Audit Plan

## Summary
Verify that the weather widget, raindrops, and cloud effects all render properly on mobile devices. Identify and fix any issues with performance, sizing, overflow, or visibility.

## Current State Analysis

### Weather Widget (mobile)
- **CSS exists** at `@media (width < 640px)` — flex-wrap, smaller font/padding
- **Looks good** — stacks with `flex-wrap: wrap` on small screens

### Raindrops (mobile)
- **Container**: `position: fixed; inset: 0; overflow: hidden` — works on mobile
- **Drop count**: 60 drops — may cause jank on low-end phones
- **Drop sizing**: 2px wide, 18px tall — fine on mobile
- **No mobile-specific reduction** — could be too many for performance

### Clouds (mobile)
- **Container**: `position: fixed; inset: 0; overflow: hidden` — works on mobile
- **Cloud size**: 300px wide + large pseudo-elements (130px, 90px) — may feel too large on a 390px phone screen
- **Cloud count**: 6 — fine
- **No mobile scaling** — clouds don't shrink for smaller viewports
- **Opacity**: 4-10% — subtle enough

### Potential Issues
1. **Rain performance**: 60 animated elements may cause frame drops on older phones
2. **Cloud size**: 300px base width is nearly full-screen on a phone — should scale down
3. **No `will-change` or GPU hints** on animated elements for smoother mobile rendering
4. **No `prefers-reduced-motion` support** — accessibility concern for users who disable animations

## Checklist

- [ ] Reduce raindrop count on mobile (60 → 30) for better performance
- [ ] Scale down cloud size on mobile (300px → 160px, proportional pseudo-elements)
- [ ] Add `will-change: transform` to raindrops and clouds for GPU acceleration
- [ ] Add `@media (prefers-reduced-motion: reduce)` to disable effects for accessibility
- [ ] Verify weather widget stacks cleanly on 390px width (iPhone 14 size)
- [ ] Verify rain/cloud containers don't cause horizontal scroll on mobile
- [ ] Test that `pointer-events: none` works on mobile touch (no tap blocking)

## Files to Modify
- `blocks/header/header.js` — mobile-aware drop/cloud count
- `blocks/header/header.css` — mobile cloud sizing, GPU hints, reduced-motion query

## Implementation Notes
Requires **Execute mode** to make the changes. All fixes are in 2 files only.
