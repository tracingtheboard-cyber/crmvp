'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/leads', label: 'Leads' },
    { href: '/enquiries', label: 'Enquiries' },
    { href: '/visits', label: 'Visits' },
    { href: '/enrolments', label: 'Enrolments' },
    { href: '/eves', label: 'EVES 月报表' },
  ];

  return (
    <header>
      {/* 顶部蓝条，模仿官网头部色带 */}
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
                style={{ height: '4.5rem' }} // 1.5 倍放大自 h-12 (3rem)
              />
              <span className="text-lg md:text-xl font-bold text-blue-600 whitespace-nowrap">
                AIC CRM
              </span>
            </Link>
            <div className="flex space-x-4">
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
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
