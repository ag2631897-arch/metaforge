/**
 * MetaForge Design System (MDS) — Design Tokens
 *
 * All CSS custom properties for the MetaForge design system.
 * These tokens are the single source of truth for all UI decisions.
 */
export const designTokensCSS = `
/* ═══════════════════════════════════════════════════════
   MetaForge Design System (MDS) — Design Tokens v1.0
   ═══════════════════════════════════════════════════════ */

:root {
  /* ─── Brand Colors ─────────────────────────────────── */
  --brand-blue: #3B5BDB;
  --brand-blue-dark: #1E3A8A;
  --brand-violet: #6366F1;
  --brand-teal: #0F9B8E;
  --brand-amber: #D97706;
  --brand-red: #DC2626;
  --brand-ink: #0B1320;

  /* ─── Surface Colors (Light) ───────────────────────── */
  --color-bg-page: #F8FAFC;
  --color-bg-surface: #FFFFFF;
  --color-bg-subtle: #F1F5F9;
  --color-bg-inverse: #0B1320;
  --color-bg-raised: #FFFFFF;

  /* ─── Text Colors (Light) ──────────────────────────── */
  --color-text-primary: #0B1320;
  --color-text-secondary: #64748B;
  --color-text-disabled: #CBD5E1;
  --color-text-inverse: #F8FAFC;
  --color-text-link: #3B5BDB;

  /* ─── Border Colors (Light) ────────────────────────── */
  --color-border-default: #E2E8F0;
  --color-border-strong: #CBD5E1;
  --color-border-focus: #3B5BDB;
  --color-border-error: #DC2626;

  /* ─── Action Colors ────────────────────────────────── */
  --color-action-primary: #3B5BDB;
  --color-action-hover: #1E3A8A;
  --color-action-active: #1E3A8A;
  --color-action-disabled: #94A3B8;

  /* ─── Status Colors ────────────────────────────────── */
  --color-status-success: #16A34A;
  --color-status-success-bg: #F0FDF4;
  --color-status-warning: #D97706;
  --color-status-warning-bg: #FFFBEB;
  --color-status-error: #DC2626;
  --color-status-error-bg: #FEF2F2;
  --color-status-info: #3B5BDB;
  --color-status-info-bg: #EEF2FF;

  /* ─── Typography ───────────────────────────────────── */
  --font-sans: 'Geist Sans', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;

  --text-display-xl: 3rem;
  --text-display-lg: 2.25rem;
  --text-display-md: 1.75rem;
  --text-heading-xl: 1.5rem;
  --text-heading-lg: 1.25rem;
  --text-heading-md: 1.125rem;
  --text-heading-sm: 1rem;
  --text-body-lg: 1rem;
  --text-body-md: 0.875rem;
  --text-body-sm: 0.8125rem;
  --text-code-md: 0.875rem;
  --text-code-sm: 0.75rem;
  --text-label-lg: 0.875rem;
  --text-label-sm: 0.75rem;

  --leading-display-xl: 1.1;
  --leading-display-lg: 1.15;
  --leading-display-md: 1.2;
  --leading-heading-xl: 1.3;
  --leading-heading-lg: 1.35;
  --leading-heading: 1.4;
  --leading-body: 1.6;
  --leading-body-sm: 1.5;
  --leading-label: 1;
  --leading-code: 1.6;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* ─── Spacing Scale ────────────────────────────────── */
  --space-0: 0rem;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* ─── Border Radius ────────────────────────────────── */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ─── Shadows ──────────────────────────────────────── */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04);
  --shadow-focus: 0 0 0 3px rgba(59, 91, 219, 0.3);
  --shadow-error: 0 0 0 3px rgba(220, 38, 38, 0.3);

  /* ─── Z-Index Scale ────────────────────────────────── */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-tooltip: 600;

  /* ─── Transitions ──────────────────────────────────── */
  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  --transition-spring: 200ms cubic-bezier(0.16, 1, 0.3, 1);

  /* ─── Layout ───────────────────────────────────────── */
  --sidebar-width: 240px;
  --sidebar-collapsed: 56px;
  --topbar-height: 56px;
  --bottombar-height: 32px;
  --content-max-width: 1440px;
  --right-panel-width: 320px;
}

/* ─── Dark Mode ──────────────────────────────────────── */
[data-theme="dark"],
.dark {
  --color-bg-page: #0B1320;
  --color-bg-surface: #141C2B;
  --color-bg-subtle: #1E293B;
  --color-bg-inverse: #FFFFFF;
  --color-bg-raised: #1E293B;

  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-disabled: #334155;
  --color-text-inverse: #0B1320;
  --color-text-link: #60A5FA;

  --color-border-default: #1E293B;
  --color-border-strong: #334155;
  --color-border-focus: #4F70E8;
  --color-border-error: #EF4444;

  --color-action-primary: #4F70E8;
  --color-action-hover: #3B5BDB;
  --color-action-active: #3B5BDB;
  --color-action-disabled: #475569;

  --color-status-success: #22C55E;
  --color-status-success-bg: rgba(34, 197, 94, 0.1);
  --color-status-warning: #F59E0B;
  --color-status-warning-bg: rgba(245, 158, 11, 0.1);
  --color-status-error: #EF4444;
  --color-status-error-bg: rgba(239, 68, 68, 0.1);
  --color-status-info: #60A5FA;
  --color-status-info-bg: rgba(96, 165, 250, 0.1);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 0 8px 10px rgba(0, 0, 0, 0.2);
}

/* Detect system dark mode preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg-page: #0B1320;
    --color-bg-surface: #141C2B;
    --color-bg-subtle: #1E293B;
    --color-bg-inverse: #FFFFFF;
    --color-bg-raised: #1E293B;

    --color-text-primary: #F1F5F9;
    --color-text-secondary: #94A3B8;
    --color-text-disabled: #334155;
    --color-text-inverse: #0B1320;
    --color-text-link: #60A5FA;

    --color-border-default: #1E293B;
    --color-border-strong: #334155;
    --color-border-focus: #4F70E8;
    --color-border-error: #EF4444;

    --color-action-primary: #4F70E8;
    --color-action-hover: #3B5BDB;
    --color-action-active: #3B5BDB;
    --color-action-disabled: #475569;

    --color-status-success: #22C55E;
    --color-status-success-bg: rgba(34, 197, 94, 0.1);
    --color-status-warning: #F59E0B;
    --color-status-warning-bg: rgba(245, 158, 11, 0.1);
    --color-status-error: #EF4444;
    --color-status-error-bg: rgba(239, 68, 68, 0.1);
    --color-status-info: #60A5FA;
    --color-status-info-bg: rgba(96, 165, 250, 0.1);

    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 0 8px 10px rgba(0, 0, 0, 0.2);
  }
}
`;
export const tokens = {
    colors: {
        brand: {
            blue: '#3B5BDB',
            blueDark: '#1E3A8A',
            violet: '#6366F1',
            teal: '#0F9B8E',
            amber: '#D97706',
            red: '#DC2626',
            ink: '#0B1320',
        },
    },
    spacing: {
        0: '0rem',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
    },
    radius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
    },
};
//# sourceMappingURL=tokens.js.map