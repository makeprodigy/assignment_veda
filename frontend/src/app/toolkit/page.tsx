'use client';

import AppLayout from '@/components/layout/AppLayout';
import { Wrench } from 'lucide-react';

export default function ToolkitPage() {
  return (
    <AppLayout title="AI Teacher's Toolkit">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F6F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Wrench size={32} color="#A9A9A9" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
          AI Teacher's Toolkit
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Coming Soon. Advanced AI tools to help you manage your classroom.
        </p>
      </div>
    </AppLayout>
  );
}
