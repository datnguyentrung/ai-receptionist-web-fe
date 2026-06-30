# Product

## Register

product

## Users

Vietnamese-speaking taekwondo academy community across four role tiers:

- **Manager Senior**: Full system access — dashboard, coach management, financial oversight. Desktop-first power user.
- **Head Coach / Coach**: Student management, schedules, attendance marking, AI check-in supervision. Primarily mobile, often on the gym floor.
- **Student / Parent**: Read-only personal profile — attendance history, tuition status, training scores. Mobile-only.
- **Guest**: Public pages — rankings, exam results. Walk-in or linked access.

Context: users interact with this app in a physical training environment (dojang/gym floor), on the move, or at a desk for admin work. Connection quality varies. Time is scarce — coaches mark attendance between classes, managers review data between tasks.

## Product Purpose

AI-powered taekwondo academy management system. Handles the full operational cycle: student enrollment, class scheduling, attendance tracking (face recognition + QR code), tuition payment, training progress scoring, and fitness rankings. Replaces manual processes with fast, reliable digital workflows. Success = coaches spend less time on admin and more time training; managers have real-time operational visibility; students and parents stay informed without asking.

## Brand Personality

Bold, Athletic, Efficient. Modern UI with professional rounded corners. Martial arts energy conveyed through confident color and sharp hierarchy, not through decoration or visual noise. The interface is a serious tool that respects the discipline of the sport.

## Anti-references

- **Generic school admin software** — gray, spreadsheet-like, lifeless data grids with no visual identity. Boring is not professional.
- **Fitness/gym apps** — dark-mode-with-neon-accent aesthetic. This is a management tool, not a personal tracker.
- **Kindergarten aesthetics** — extreme bubbly shapes, soft pastel palettes, oversized rounded corners, playful illustrations. This serves a martial arts academy, not a preschool.
- **Overly padded data screens** — data tables, student lists, and schedules must remain dense and scanable. Whitespace luxury is wrong here.

## Design Principles

1. **Efficiency first** — dense, scannable data screens (tables, lists, schedules) prioritize information over whitespace. Every extra tap or scroll is a failure.
2. **Bold identity, not decoration** — martial arts confidence through strong color use and clear hierarchy. Visual weight serves readability, never spectacle.
3. **Mobile-native, not mobile-compromised** — designed for touch-first, on-the-floor use. 48px targets, safe area insets, no-hover touch interactions. Desktop adapts up from mobile.
4. **Professional density** — information-rich screens show enough data to be useful at a glance. Charts, tables, and status indicators pack tightly without feeling cluttered.
5. **Respect the user's time** — AI check-in, quick actions, cached data, fast load paths. The app should feel faster than the process it replaces.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum compliance
- High contrast mode support (system-level `prefers-contrast`)
- Vietnamese-first a11y: all UI strings, labels, and screen reader text in proper Vietnamese
- 48px minimum touch targets (already enforced)
- Keyboard navigation support with visible focus states
- Screen reader-friendly semantic structure
