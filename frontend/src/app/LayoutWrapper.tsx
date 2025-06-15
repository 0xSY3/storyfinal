'use client';

import { usePathname } from 'next/navigation';
import ClientLayoutShell from './ClientLayoutShell';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <ClientLayoutShell>
      {children}
    </ClientLayoutShell>
  );
}