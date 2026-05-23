'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />
      <main className="flex flex-col flex-1 h-screen overflow-hidden relative">
        {showTopBar && (
          <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <TopBar title={title} backHref={backHref} breadcrumb={breadcrumb} />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-[80px]">
          {children}
        </div>
      </main>
    </div>
  );
}
