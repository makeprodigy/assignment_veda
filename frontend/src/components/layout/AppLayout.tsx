'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileTabBar from './MobileTabBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  breadcrumb?: string;
  showTopBar?: boolean;
}

export default function AppLayout({
  children,
  title = 'Dashboard',
  backHref,
  breadcrumb,
  showTopBar = true,
}: AppLayoutProps) {
  const pathname = usePathname();
  const showFab = !pathname?.startsWith('/assignments/create') && !pathname?.startsWith('/assignments/result');

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>
      <main className="flex flex-col flex-1 h-screen overflow-hidden relative">
        {showTopBar && (
          <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <TopBar title={title} backHref={backHref} breadcrumb={breadcrumb} />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-[90px] md:pb-4 pt-[80px]">
          {children}
        </div>
        
        {/* Gradual blur effect at the bottom for mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[100px] pointer-events-none z-30">
          <div className="absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,transparent,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent opacity-90" />
        </div>

        <MobileTabBar />
        
        {/* Global Mobile Sticky FAB */}
        {showFab && (
          <div className="md:hidden fixed bottom-[84px] right-5 z-40">
            <Link 
              href="/assignments/create" 
              className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-gray-100 transition-all active:scale-95 no-underline"
            >
              <Plus size={24} className="text-[#FF5623]" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
