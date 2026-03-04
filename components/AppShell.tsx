'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  );
}
