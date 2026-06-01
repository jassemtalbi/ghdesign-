import type { ReactNode } from 'react';

export const metadata = { title: 'GH Design — Admin' };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body { cursor: default !important; }
        button, a, input, select, textarea { cursor: auto !important; }
        button { cursor: pointer !important; }
      `}</style>
      {children}
    </>
  );
}
