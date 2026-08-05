import type { ExpenseCategory } from '../types';

const PATHS: Record<ExpenseCategory, React.ReactNode> = {
  Food: (
    <>
      <path d="M7 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M9 11v11" />
      <path d="M16 2c-1.5 1.5-2 3-2 5.5S15 12 16 12s2-2 2-4.5-.5-4-2-5.5Z" />
      <path d="M16 12v10" />
    </>
  ),
  Transport: (
    <>
      <path d="M4 16V9.5a2 2 0 0 1 1.2-1.83L8 6.5h8l2.8 1.17A2 2 0 0 1 20 9.5V16" />
      <path d="M4 16h16" />
      <path d="M4 16v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <path d="M17 16v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <path d="M8 12h8" />
    </>
  ),
  Accommodation: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </>
  ),
  Utilities: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  ),
  Entertainment: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="1.5" />
      <path d="M3 10h18" />
      <path d="M7 6 5 10M12 6l-2 4M17 6l-2 4" />
    </>
  ),
  Shopping: (
    <>
      <path d="M6 8h12l-1 12a1.5 1.5 0 0 1-1.5 1.4H8.5A1.5 1.5 0 0 1 7 20L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  Other: (
    <path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />
  ),
};

export default function CategoryIcon({ category, className }: { category: ExpenseCategory; className?: string }) {
  const path = PATHS[category] ?? PATHS.Other;
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
