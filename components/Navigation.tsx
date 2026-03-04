'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/enquiries', label: 'Enquiries' },
    { href: '/visits', label: 'Visits' },
    { href: '/enrolments', label: 'Enrolments' },
    { href: '/eves', label: 'EVES Monthly Report' },
  ];

  return (
    <header>
      {/* Top brand bar */}
      <div
        className="h-20 w-full"
        style={{ backgroundColor: '#002f5f' }}
      />

      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/aic-logo.png"
                alt="Asian International College Logo"
                className="h-12 w-auto object-contain"
                style={{ height: '4.5rem' }}
              />
              <span className="text-lg md:text-xl font-bold text-blue-600 whitespace-nowrap">
                AIC CRM
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <span className="text-sm text-gray-600 truncate max-w-[120px]" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
