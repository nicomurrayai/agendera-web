const paths = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  down: 'M12 4v16m-6-6 6 6 6-6',
  check: 'm5 12 4 4L19 6',
  book: 'M12 6c-3-2-7-2-10-1v15c3-1 7-1 10 1m0-15c3-2 7-2 10-1v15c-3-1-7-1-10 1m0-15v15',
  leaf: 'M20 3C10 2 3 7 5 14c2 6 13 5 15-11ZM4 21 15 10',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  shield: 'M12 3 3 7v5c0 5 5 8 9 10 4-2 9-5 9-10V7l-9-4Zm-4 9 3 3 5-6',
  printer: 'M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v8H7v-8Zm10-3h1',
} as const;

export function LandingIcon({ name, className }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
