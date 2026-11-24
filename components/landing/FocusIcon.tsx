import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  health: <path d="M12 21s-8-4.9-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5C20 16.1 12 21 12 21Z" />,
  skills: <path d="M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z" />,
  livelihoods: <path d="M12 21V11m0 0c0-4 3-7 8-7 0 5-3 8-8 8Zm0 0c0-3.5-2.5-6-7-6 0 4.5 2.5 7 7 7Z" />,
  education: <path d="M12 3 2 8l10 5 10-5-10-5ZM5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />,
};

export default function FocusIcon({ name }: { name: keyof typeof paths | string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.skills}
    </svg>
  );
}
