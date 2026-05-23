'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, PieChart, Sparkles } from 'lucide-react';

export default function MobileTabBar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutGrid },
    { label: 'Assignments', href: '/assignments', icon: FileText },
    { label: 'Library', href: '/library', icon: PieChart },
    { label: 'AI Toolkit', href: '/toolkit', icon: Sparkles },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-[#171717] rounded-full shadow-2xl px-2 py-3 flex items-center justify-between border border-white/10">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full gap-1 no-underline transition-colors ${
                active ? 'text-white' : 'text-[#8C8C8C] hover:text-[#A3A3A3]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium font-body ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
