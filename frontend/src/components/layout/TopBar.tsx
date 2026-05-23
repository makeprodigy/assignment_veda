'use client';

import Link from 'next/link';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface TopBarProps {
  title: string;
  backHref?: string;
  breadcrumb?: string;
}

export default function TopBar({ title, backHref, breadcrumb }: TopBarProps) {
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isTopLevel = ['/', '/dashboard', '/assignments', '/groups', '/toolkit', '/library', '/settings'].includes(pathname);
  const showBackButton = backHref || !isTopLevel;

  return (
    <header className="flex items-center justify-between px-5 py-2 z-10 shrink-0 border border-white/30 bg-white/80 backdrop-blur-md rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.03)]">
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer border border-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-[#171717]" />
          </button>
        )}

        <div className="flex items-center gap-3 ml-1">
          <LayoutGrid size={18} className="text-[#9CA3AF]" strokeWidth={2} />
          {breadcrumb && (
            <>
              <span className="text-[15px] font-semibold text-[#9CA3AF] font-bricolage">{breadcrumb}</span>
              <span className="text-[15px] font-semibold text-[#9CA3AF] mx-0.5">/</span>
            </>
          )}
          <h1 className="text-[15px] font-semibold text-[#9CA3AF] font-bricolage">{title}</h1>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-4">
        {/* Notification bell (hoverable) */}
        <div className="relative group">
          <button
            className="relative flex items-center justify-center w-7 h-7 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={14} className="text-[#5D5D5D]" />
            {/* Orange dot */}
            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D84315]" />
          </button>
          
          {/* Notification Dropdown (shows on hover) */}
          <div className="absolute right-0 mt-2 bg-white border border-[var(--color-border)] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-[280px] top-full py-1">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <span className="text-[14px] font-semibold font-heading text-[var(--color-text-primary)]">Notifications</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-[13px] font-body text-[var(--color-text-secondary)] mb-1">You have new assignments to review!</p>
              <p className="text-[11px] font-body text-[var(--color-text-muted)] m-0">2 hours ago</p>
            </div>
            <div className="px-4 py-2 text-center border-t border-[var(--color-border)]">
              <button className="text-[12px] font-semibold font-body text-[var(--color-orange)] bg-transparent border-none cursor-pointer">Mark all as read</button>
            </div>
          </div>
        </div>

        {/* User dropdown (toggleable) */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center rounded-full border border-[var(--color-border)] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors cursor-pointer p-0.5 pr-3"
          >
            <div className="w-7 h-7 rounded-full bg-[#D84315] flex items-center justify-center shrink-0 mr-2">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-[11px]">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              )}
            </div>
            <span className="font-semibold text-[#171717] truncate text-[13px] max-w-[100px]">
              {user?.name ?? 'Teacher'}
            </span>
            <ChevronDown size={14} className="text-[#A9A9A9] ml-1" />
          </button>

          {/* User Menu Popup */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-[var(--color-border)] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border)] mb-1">
                <p className="font-heading text-[14px] font-semibold text-[var(--color-text-primary)] m-0 whitespace-nowrap overflow-hidden text-ellipsis">{user?.name ?? 'John Doe'}</p>
                <p className="font-body text-[12px] text-[var(--color-text-secondary)] mt-0.5 mb-0 whitespace-nowrap overflow-hidden text-ellipsis">{user?.email ?? 'john@example.com'}</p>
              </div>
              <button className="w-full text-left px-4 py-2.5 text-[13px] font-body font-medium text-[var(--color-text-secondary)] bg-transparent border-none flex items-center gap-2 cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
                <User size={14} /> Profile Settings
              </button>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-[13px] font-body font-medium text-red-500 bg-transparent border-none flex items-center gap-2 cursor-pointer hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
